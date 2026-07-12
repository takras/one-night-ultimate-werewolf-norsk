import { useState, useEffect, useRef } from 'react';
import './GameScreen.css';
import { useTranslation } from '../i18n.jsx';
import { buildPlayOrder } from '../utils/playOrder';
import { getAudioCatalog } from '../data/audioCatalog';
import { assetUrl } from '../utils/assetUrl';

// Chance a random noise plays before/after any given step in the night phase
const NOISE_CHANCE = 0.3;

export default function GameScreen({ config, onGameEnd }) {
  const { t, language } = useTranslation();

  const characterName = (entry) =>
    language === 'no' ? entry.characterName : (entry.characterNameEnglish || entry.characterName);
  const [playOrder, setPlayOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [musicTracks, setMusicTracks] = useState([]);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [narrationVolume, setNarrationVolume] = useState(1);

  // Game phases: 'start', 'night', 'night_end', 'discussion_instructions', 'discussion', 'discussion_end', 'complete'
  const [gamePhase, setGamePhase] = useState('start');

  const audioRef = useRef(new Audio());
  const backgroundMusicRef = useRef(new Audio());
  const timerIntervalRef = useRef(null);
  const wakeLockRef = useRef(null);
  const cancelledRef = useRef(false);
  const hasStartedRef = useRef(false);
  const pendingAudioResolveRef = useRef(null);
  const pendingCountdownResolveRef = useRef(null);
  const musicPlaylistRef = useRef([]);
  const musicIndexRef = useRef(0);
  const musicEnabledRef = useRef(true);
  const musicVolumeRef = useRef(0.4);
  const narrationVolumeRef = useRef(1);
  const lastNoiseIdRef = useRef(null);
  const audioCatalogRef = useRef([]);
  const preloadedAudioRef = useRef([]);

  // Fetch play order on mount
  useEffect(() => {
    // React.StrictMode mounts, unmounts, then remounts once in dev to catch
    // missing cleanup; the synthetic unmount's cleanup below sets this true,
    // so it must be reset here or the real run looks cancelled forever.
    cancelledRef.current = false;
    fetchPlayOrder();
    requestWakeLock();
    return () => {
      cancelledRef.current = true;
      releaseWakeLock();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (pendingCountdownResolveRef.current) {
        const resolve = pendingCountdownResolveRef.current;
        pendingCountdownResolveRef.current = null;
        resolve();
      }
      if (pendingAudioResolveRef.current) {
        const resolve = pendingAudioResolveRef.current;
        pendingAudioResolveRef.current = null;
        resolve();
      }
      audioRef.current.pause();
      backgroundMusicRef.current.onended = null;
      backgroundMusicRef.current.pause();
    };
  }, []);

  // Drives the whole game as one sequence: each audio clip plays to
  // completion before the next step starts, and random noises get a chance
  // to play before/after each night-phase step.
  useEffect(() => {
    if (loading || playOrder.length === 0 || hasStartedRef.current) return;
    hasStartedRef.current = true;
    runGameSequence();
  }, [loading, playOrder]);

  const fetchPlayOrder = async () => {
    try {
      setLoading(true);
      // Play order is computed locally (no backend needed); the audio
      // catalog still needs a fetch (live in dev, static manifest on a
      // GitHub Pages build with no backend) before the sequence can start.
      const order = buildPlayOrder(
        config.selectedCharacters,
        config.duration,
        config.complexCharacters
      );
      const catalog = await getAudioCatalog();
      setPlayOrder(order);
      setTimeRemaining(order[0]?.duration || config.duration);
      audioCatalogRef.current = catalog;
      preloadGameAudio(order, catalog);
    } catch (err) {
      setError(t('failedPlayOrder'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Kicks off background downloads for every clip this game could need, so
  // the browser already has them cached by the time playback reaches them.
  // Fire-and-forget: doesn't block the game from starting. Noise/music are
  // shared across voices; narration only needs the selected voice's clips.
  const preloadGameAudio = (order, catalog) => {
    const gamePhaseTypes = ['game_start', 'night_end', 'discussion_instruction', 'discussion_end'];
    const urls = new Set();

    catalog.forEach(a => {
      if (a.audioType === 'random_noise' || a.audioType === 'background_music') {
        urls.add(a.url);
      } else if (gamePhaseTypes.includes(a.audioType) && a.voiceId === config.voiceId) {
        urls.add(a.url);
      }
    });

    order.forEach(entry => {
      catalog.forEach(a => {
        if (a.characterId === entry.characterId && (a.audioType === 'activation' || a.audioType === 'end') && a.voiceId === config.voiceId) {
          urls.add(a.url);
        }
      });
    });

    preloadedAudioRef.current = [...urls].map(url => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = assetUrl(url);
      audio.load();
      return audio;
    });
  };

  // Plays a clip and resolves once it has actually finished playing (or
  // immediately if there's nothing to play / it can't play), so the game
  // never advances over the top of narration.
  const playAudioToEnd = (url) => {
    return new Promise((resolve) => {
      const audio = audioRef.current;
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.volume = narrationVolumeRef.current;
      audio.src = assetUrl(url);

      let settled = false;
      let safetyTimeout;
      const finish = () => {
        if (settled) return;
        settled = true;
        audio.onended = null;
        audio.onerror = null;
        clearTimeout(safetyTimeout);
        if (pendingAudioResolveRef.current === finish) {
          pendingAudioResolveRef.current = null;
        }
        resolve();
      };

      pendingAudioResolveRef.current = finish;
      audio.onended = finish;
      audio.onerror = finish;
      // Safety net in case 'ended' never fires for some reason
      safetyTimeout = setTimeout(finish, 30000);

      audio.play().catch((err) => {
        console.warn('Could not autoplay audio:', err);
        finish();
      });
    });
  };

  // Reads from the catalog fetched once in fetchPlayOrder, not a fresh
  // network round trip per clip
  const getAudioUrl = (predicate) => audioCatalogRef.current.find(predicate) || null;

  const playCharacterAudio = async (characterId, audioType) => {
    const audioFile = getAudioUrl(
      a => a.characterId === characterId && a.audioType === audioType && a.voiceId === config.voiceId
    );
    if (!audioFile) return;
    await playAudioToEnd(audioFile.url);
  };

  const playGameAudio = async (audioType) => {
    const audioFile = getAudioUrl(a => a.audioType === audioType && a.voiceId === config.voiceId);
    if (!audioFile) return;
    await playAudioToEnd(audioFile.url);
  };

  // Background music plays independently of narration/noise (its own audio
  // element) and loops for the whole game. Multiple uploaded tracks are
  // shuffled once per game and chained into a playlist.
  const playCurrentMusicTrack = () => {
    const playlist = musicPlaylistRef.current;
    if (playlist.length === 0) return;
    const track = playlist[musicIndexRef.current % playlist.length];
    const audio = backgroundMusicRef.current;
    audio.src = assetUrl(track.url);
    audio.volume = musicVolumeRef.current;
    audio.loop = playlist.length === 1;
    audio.onended = playlist.length > 1
      ? () => {
          musicIndexRef.current += 1;
          playCurrentMusicTrack();
        }
      : null;
    if (musicEnabledRef.current) {
      audio.play().catch(err => console.warn('Could not autoplay background music:', err));
    }
  };

  const startBackgroundMusic = () => {
    const tracks = audioCatalogRef.current.filter(a => a.audioType === 'background_music');
    if (tracks.length === 0 || cancelledRef.current) return;
    setMusicTracks(tracks);
    musicPlaylistRef.current = [...tracks].sort(() => Math.random() - 0.5);
    musicIndexRef.current = 0;
    playCurrentMusicTrack();
  };

  const toggleMusic = () => {
    setMusicEnabled(prev => {
      const next = !prev;
      musicEnabledRef.current = next;
      const audio = backgroundMusicRef.current;
      if (next) {
        if (audio.src) audio.play().catch(() => {});
      } else {
        audio.pause();
      }
      return next;
    });
  };

  const handleMusicVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    musicVolumeRef.current = vol;
    backgroundMusicRef.current.volume = vol;
  };

  const handleNarrationVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setNarrationVolume(vol);
    narrationVolumeRef.current = vol;
    audioRef.current.volume = vol;
  };

  // Picks a noise other than whichever one just played, so the same clip
  // never plays twice in a row (when more than one noise is available)
  const maybePlayRandomNoise = async () => {
    if (Math.random() > NOISE_CHANCE) return;
    const noises = audioCatalogRef.current.filter(a => a.audioType === 'random_noise');
    if (noises.length === 0) return;
    const candidates = noises.length > 1
      ? noises.filter(n => n.characterId !== lastNoiseIdRef.current)
      : noises;
    const noise = candidates[Math.floor(Math.random() * candidates.length)];
    lastNoiseIdRef.current = noise.characterId;
    await playAudioToEnd(noise.url);
  };

  // Counts down `seconds`, updating the on-screen timer once per second
  const countdown = (seconds) => {
    return new Promise((resolve) => {
      setTimeRemaining(seconds);
      if (seconds <= 0) {
        resolve();
        return;
      }
      let remaining = seconds;
      pendingCountdownResolveRef.current = resolve;
      timerIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setTimeRemaining(Math.max(0, remaining));
        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          pendingCountdownResolveRef.current = null;
          resolve();
        }
      }, 1000);
    });
  };

  // Lets the discussion timer be cut short (e.g. "Go to voting" button) by
  // resolving whatever countdown promise is currently pending, same as if
  // it had reached zero naturally
  const skipCountdown = () => {
    if (!pendingCountdownResolveRef.current) return;
    const resolve = pendingCountdownResolveRef.current;
    pendingCountdownResolveRef.current = null;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeRemaining(0);
    resolve();
  };

  const runGameSequence = async () => {
    startBackgroundMusic();

    setGamePhase('start');
    await playGameAudio('game_start');
    if (cancelledRef.current) return;

    setGamePhase('night');
    for (let i = 0; i < playOrder.length; i++) {
      if (cancelledRef.current) return;
      setCurrentIndex(i);
      const entry = playOrder[i];

      await maybePlayRandomNoise();
      if (cancelledRef.current) return;

      await playCharacterAudio(entry.characterId, 'activation');
      if (cancelledRef.current) return;

      await countdown(entry.duration);
      if (cancelledRef.current) return;

      if (!entry.skipEndAudio) {
        await playCharacterAudio(entry.characterId, 'end');
        if (cancelledRef.current) return;
      }

      await maybePlayRandomNoise();
      if (cancelledRef.current) return;
    }

    setGamePhase('night_end');
    await playGameAudio('night_end');
    if (cancelledRef.current) return;

    setGamePhase('discussion_instructions');
    await playGameAudio('discussion_instruction');
    if (cancelledRef.current) return;

    setGamePhase('discussion');
    await countdown(config.discussionDuration || 120);
    if (cancelledRef.current) return;

    setGamePhase('discussion_end');
    await playGameAudio('discussion_end');
    if (cancelledRef.current) return;

    setGamePhase('complete');
    setIsPlaying(false);
    endGame();
  };

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
      }
    } catch (err) {
      console.warn('Wake Lock not available:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock released');
      } catch (err) {
        console.warn('Error releasing wake lock:', err);
      }
    }
  };

  const endGame = () => {
    releaseWakeLock();
    audioRef.current.pause();
    backgroundMusicRef.current.pause();
  };

  // Unmounting (which onGameEnd triggers, by switching screens in App.jsx)
  // runs the mount effect's cleanup automatically - that already pauses all
  // audio, releases the wake lock, and unblocks the in-flight sequence via
  // cancelledRef, so this just needs the confirmation gate.
  const handleBackToHome = () => {
    if (confirm(t('confirmEndGame'))) {
      onGameEnd();
    }
  };

  if (loading) {
    return <div className="game-screen loading">{t('initializingGame')}</div>;
  }

  if (error) {
    return <div className="game-screen error">{error}</div>;
  }

  if (playOrder.length === 0) {
    return <div className="game-screen error">{t('noCharactersSelected')}</div>;
  }

  const currentCharacter = playOrder[currentIndex];
  const nextCharacter = playOrder[currentIndex + 1];
  const gameProgress = gamePhase === 'night' ? ((currentIndex + 1) / playOrder.length) * 100 : 100;

  const renderPhaseContent = () => {
    switch (gamePhase) {
      case 'start':
        return (
          <div className="phase-display">
            <h2>{t('gameStarting')}</h2>
            <p>{t('preparingNightPhase')}</p>
            <div className="spinner"></div>
          </div>
        );

      case 'night':
        return (
          <>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${gameProgress}%` }}></div>
            </div>
            <div className="game-content">
              <div className="character-display">
                {currentCharacter && (
                  <>
                    {currentCharacter.image && (
                      <div className="active-character-image">
                        <img
                          src={assetUrl(`karakterer/${currentCharacter.image}`)}
                          alt={characterName(currentCharacter)}
                          onError={(e) => {
                            e.target.src = assetUrl('karakterer/livvakt.webp');
                          }}
                        />
                      </div>
                    )}
                    <div className="timer-display">
                      <div className="timer-value">{timeRemaining}</div>
                      <div className="timer-label">{t('seconds')}</div>
                    </div>
                    <div className="character-name">
                      {characterName(currentCharacter)}
                    </div>
                    <div className="position-info">
                      {t('stepOf', { current: currentIndex + 1, total: playOrder.length })}
                    </div>
                  </>
                )}
              </div>
              {nextCharacter && (
                <div className="next-preview">
                  <h3>{t('next')}</h3>
                  <p>{characterName(nextCharacter)}</p>
                </div>
              )}
              <div className="game-stats">
                <div className="stat">
                  <span className="stat-label">{t('playersStat')}</span>
                  <span className="stat-value">{Math.max(0, config.selectedCharacters.length - 3)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t('durationStat')}</span>
                  <span className="stat-value">{config.duration}s</span>
                </div>
              </div>
            </div>
          </>
        );

      case 'night_end':
        return (
          <div className="phase-display">
            <h2>{t('nightPhaseEnded')}</h2>
            <p>{t('preparingDiscussion')}</p>
            <div className="spinner"></div>
          </div>
        );

      case 'discussion_instructions':
        return (
          <div className="phase-display">
            <h2>{t('discussionInstructions')}</h2>
            <p>{t('listenCarefully')}</p>
            <div className="spinner"></div>
          </div>
        );

      case 'discussion':
        return (
          <div className="discussion-phase">
            <h2>{t('discussionPhase')}</h2>
            <div className="discussion-timer">
              <div className="timer-display">
                <div className="timer-value">{timeRemaining}</div>
                <div className="timer-label">{t('seconds')}</div>
              </div>
            </div>
            <p>{t('discussAndVote')}</p>
            <button className="skip-to-voting-button" onClick={skipCountdown}>
              {t('goToVoting')}
            </button>
          </div>
        );

      case 'discussion_end':
        return (
          <div className="phase-display">
            <h2>{t('discussionEnded')}</h2>
            <p>{t('finalizingGame')}</p>
            <div className="spinner"></div>
          </div>
        );

      case 'complete':
        return (
          <div className="game-complete">
            <div className="completion-message">
              <h2>{t('gameComplete')}</h2>
              <p>{t('tallyVotes')}</p>
              <button className="back-button" onClick={onGameEnd}>
                {t('backToHome')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="game-screen">
      {renderPhaseContent()}

      {gamePhase !== 'complete' && (
        <button
          className="back-to-home-button"
          onClick={handleBackToHome}
          title={t('backToHome')}
        >
          {t('backToHome')}
        </button>
      )}

      {gamePhase !== 'complete' && (
        <div className="playback-controls">
          <div className="volume-control">
            <span className="volume-icon" title={t('narrationVolume')}>🗣️</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={narrationVolume}
              onChange={handleNarrationVolumeChange}
              className="volume-slider"
              title={t('narrationVolume')}
            />
          </div>

          {musicTracks.length > 0 && (
            <div className="volume-control">
              <button
                className={`music-toggle ${musicEnabled ? 'on' : 'off'}`}
                onClick={toggleMusic}
                title={musicEnabled ? t('musicPause') : t('musicPlay')}
              >
                {musicEnabled ? '🔊' : '🔇'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                className="volume-slider"
                title={t('musicVolume')}
              />
            </div>
          )}
        </div>
      )}

      <audio ref={audioRef} crossOrigin="anonymous" />
      <audio ref={backgroundMusicRef} crossOrigin="anonymous" />
    </div>
  );
}
