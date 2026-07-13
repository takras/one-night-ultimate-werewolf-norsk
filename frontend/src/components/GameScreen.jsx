import { useState, useEffect, useRef } from 'react';
import './GameScreen.css';
import { useTranslation } from '../i18n.jsx';
import { buildPlayOrder } from '../utils/playOrder';
import { getAudioCatalog } from '../data/audioCatalog';
import { assetUrl } from '../utils/assetUrl';
import charactersData from '../data/characters.json';
import { weightedRandomPick } from '../utils/weightedRandom';
import { pickTargetFragmentId, playerNumberFragmentId, MAX_PLAYER_NUMBER_FRAGMENTS } from '../data/targetFragments';
import { RIPPLE_TRIGGER_CHANCE_PER_TYPE, eligibleRippleEvents } from '../data/rippleEvents';
import { unlockAudioContext, getAudioContext } from '../utils/audioContext';

// Chance a random noise plays before/after any given step in the night phase
const NOISE_CHANCE = 0.3;

const baseCharacterId = (id) => id.replace(/_\d+$/, '');

// Roles whose narration branches (Rascal/Alien/Exposer/Mortician) or target
// (Psychic) are picked at runtime rather than recorded as one fixed clip,
// keyed by the same group id used in the play order (utils/playOrder.js)
const narrationConfigByGroupId = {};
charactersData.characters.forEach((char) => {
  if (!char.narrationVariants && !char.targetType) return;
  narrationConfigByGroupId[baseCharacterId(char.id)] = {
    narrationVariants: char.narrationVariants || null,
    targetType: char.targetType || null,
  };
});

// Picks `count` distinct player numbers from 1..maxN, for ripples that
// call out specific seats (e.g. "Spiller 3 og 7, ...")
function pickDistinctPlayerNumbers(maxN, count) {
  const pool = Array.from({ length: maxN }, (_, i) => i + 1);
  const picked = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

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
  const [oracleGuaranteedRipple, setOracleGuaranteedRipple] = useState(false);

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
  const variantChoiceRef = useRef({});
  const oracleGuaranteedRippleRef = useRef(false);
  const narrationGainRef = useRef(null);
  const musicGainRef = useRef(null);
  const audioBufferCacheRef = useRef(new Map());
  const currentBufferSourceRef = useRef(null);

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
      // React may have already detached these refs (set to null) by the
      // time this cleanup runs, since ref detachment happens in the commit
      // phase before passive-effect cleanup fires
      audioRef.current?.pause();
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.onended = null;
        backgroundMusicRef.current.pause();
      }
      if (currentBufferSourceRef.current) {
        try { currentBufferSourceRef.current.stop(); } catch { /* already stopped */ }
        currentBufferSourceRef.current = null;
      }
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
      } else if (a.audioType === 'fragment' && a.voiceId === config.voiceId) {
        // Which fragment gets picked is decided at runtime, so preload the
        // whole (small) fragment set rather than trying to predict it
        urls.add(a.url);
      }
    });

    order.forEach(entry => {
      const narrationConfig = narrationConfigByGroupId[entry.characterId];
      const clipIds = narrationConfig?.narrationVariants
        ? [entry.characterId, ...narrationConfig.narrationVariants.map(v => v.id)]
        : [entry.characterId];

      clipIds.forEach(clipId => {
        catalog.forEach(a => {
          if (a.characterId === clipId && (a.audioType === 'activation' || a.audioType === 'end') && a.voiceId === config.voiceId) {
            urls.add(a.url);
          }
        });
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

  // Sets up the Web Audio graph so volume sliders actually work on iOS,
  // where writing to <audio>.volume directly is silently ignored. Music
  // still routes through its <audio> element (MediaElementSourceNode) since
  // it rarely changes src. Narration does NOT: iOS has a known WebKit bug
  // where repeatedly changing the src of an element already wrapped in
  // MediaElementSourceNode silently drops it from the Web Audio graph after
  // the first clip, so gain stops applying - and narration restarts a new
  // clip constantly. Narration instead plays via a fresh
  // AudioBufferSourceNode per clip (see playAudioToEnd), which sidesteps
  // that bug entirely; the narration gain just needs to reach the
  // destination, no element to wrap.
  const ensureAudioGraph = () => {
    if (narrationGainRef.current) return;
    const ctx = unlockAudioContext();
    if (!ctx) return;
    try {
      const narrationGain = ctx.createGain();
      narrationGain.gain.value = narrationVolumeRef.current;
      narrationGain.connect(ctx.destination);

      const musicSource = ctx.createMediaElementSource(backgroundMusicRef.current);
      const musicGain = ctx.createGain();
      musicGain.gain.value = musicVolumeRef.current;
      musicSource.connect(musicGain).connect(ctx.destination);

      narrationGainRef.current = narrationGain;
      musicGainRef.current = musicGain;
    } catch (err) {
      console.warn('Could not set up Web Audio volume control:', err);
    }
  };

  // Fetches + decodes a clip once and caches the AudioBuffer, since ripple
  // fragments, random noise, and player-number clips get replayed often
  const loadAudioBuffer = async (ctx, url) => {
    const cache = audioBufferCacheRef.current;
    const fullUrl = assetUrl(url);
    if (cache.has(fullUrl)) return cache.get(fullUrl);
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    cache.set(fullUrl, audioBuffer);
    return audioBuffer;
  };

  // Fallback narration playback via the plain <audio> element - used when
  // Web Audio isn't available, or a clip fails to fetch/decode. Volume
  // control is best-effort here (broken on iOS, fine everywhere else).
  const playViaAudioElement = (url) => {
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

  // Plays a clip and resolves once it has actually finished playing (or
  // immediately if there's nothing to play / it can't play), so the game
  // never advances over the top of narration.
  const playAudioToEnd = async (url) => {
    const ctx = getAudioContext();
    if (!ctx || !narrationGainRef.current) {
      return playViaAudioElement(url);
    }

    let buffer;
    try {
      buffer = await loadAudioBuffer(ctx, url);
    } catch (err) {
      console.warn('Could not decode audio, falling back to <audio> element:', err);
      return playViaAudioElement(url);
    }
    if (cancelledRef.current) return;

    return new Promise((resolve) => {
      if (currentBufferSourceRef.current) {
        try { currentBufferSourceRef.current.stop(); } catch { /* already stopped */ }
        currentBufferSourceRef.current = null;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(narrationGainRef.current);

      let settled = false;
      let safetyTimeout;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(safetyTimeout);
        if (currentBufferSourceRef.current === source) {
          currentBufferSourceRef.current = null;
        }
        if (pendingAudioResolveRef.current === finish) {
          pendingAudioResolveRef.current = null;
        }
        resolve();
      };

      pendingAudioResolveRef.current = finish;
      source.onended = finish;
      // Safety net in case 'ended' never fires for some reason
      safetyTimeout = setTimeout(finish, (buffer.duration + 5) * 1000);

      currentBufferSourceRef.current = source;
      source.start(0);
    });
  };

  // Reads from the catalog fetched once in fetchPlayOrder, not a fresh
  // network round trip per clip
  const getAudioUrl = (predicate) => audioCatalogRef.current.find(predicate) || null;

  const playFragmentClip = async (fragmentId) => {
    const audioFile = getAudioUrl(
      a => a.characterId === fragmentId && a.audioType === 'fragment' && a.voiceId === config.voiceId
    );
    if (!audioFile) return;
    await playAudioToEnd(audioFile.url);
  };

  // For roles with narrationVariants (Rascal/Alien/Exposer/Mortician), picks
  // a weighted-random variant on 'activation' and remembers it for this play
  // order step so 'end' reuses the same one, if a variant-specific end clip
  // was ever recorded. targetType (fixed on the role, e.g. Psychic, or on
  // the picked variant) says which fragment - if any - to splice on after
  // activation plays.
  const resolveActivationClip = (characterId, audioType, stepIndex) => {
    const narrationConfig = narrationConfigByGroupId[characterId];
    if (!narrationConfig) return { clipId: characterId, targetType: null };

    if (narrationConfig.narrationVariants) {
      let variant = variantChoiceRef.current[stepIndex];
      if (audioType === 'activation' || !variant) {
        variant = weightedRandomPick(narrationConfig.narrationVariants);
        variantChoiceRef.current[stepIndex] = variant;
      }
      return { clipId: variant.id, targetType: audioType === 'activation' ? (variant.targetType || null) : null };
    }

    return { clipId: characterId, targetType: audioType === 'activation' ? narrationConfig.targetType : null };
  };

  const playCharacterAudio = async (characterId, audioType, stepIndex) => {
    const { clipId, targetType } = resolveActivationClip(characterId, audioType, stepIndex);

    let audioFile = getAudioUrl(
      a => a.characterId === clipId && a.audioType === audioType && a.voiceId === config.voiceId
    );
    // Fall back to the base role's clip if this variant has no recording
    // for this audio type yet (e.g. no variant-specific "end" line - the
    // base role's end plays instead)
    if (!audioFile && clipId !== characterId) {
      audioFile = getAudioUrl(
        a => a.characterId === characterId && a.audioType === audioType && a.voiceId === config.voiceId
      );
    }
    if (!audioFile) return;
    await playAudioToEnd(audioFile.url);

    if (audioType !== 'activation' || !targetType) return;
    await playFragmentClip(pickTargetFragmentId(targetType));
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
    audio.volume = musicGainRef.current ? 1 : musicVolumeRef.current;
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
    unlockAudioContext();
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = vol;
    } else {
      backgroundMusicRef.current.volume = vol;
    }
  };

  const handleNarrationVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setNarrationVolume(vol);
    narrationVolumeRef.current = vol;
    unlockAudioContext();
    if (narrationGainRef.current) {
      narrationGainRef.current.gain.value = vol;
    } else {
      audioRef.current.volume = vol;
    }
  };

  const setOracleGuarantee = (value) => {
    setOracleGuaranteedRipple(value);
    oracleGuaranteedRippleRef.current = value;
  };

  // Ripples are never triggered by the narrator - the app rolls for one
  // itself. Each eligible ripple gets an independent 5% roll, checked one
  // at a time in random order; the first one that hits is the one that
  // happens, and checking stops there - if none hit, no ripple this round.
  // The Oracle player answering "yes" to the in-game "guarantee a ripple?"
  // question (see the Oracle prompt rendered during their night turn) skips
  // the rolls entirely and guarantees one, picked uniformly at random.
  const pickTriggeredRipple = (eligible) => {
    if (oracleGuaranteedRippleRef.current) {
      return eligible[Math.floor(Math.random() * eligible.length)];
    }
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    for (const ripple of shuffled) {
      if (Math.random() < RIPPLE_TRIGGER_CHANCE_PER_TYPE) return ripple;
    }
    return null;
  };

  const maybePlayRipple = async () => {
    const eligible = eligibleRippleEvents(config.selectedCharacters);
    if (eligible.length === 0) return;

    const ripple = pickTriggeredRipple(eligible);
    if (!ripple) return;

    await playFragmentClip('ripple_intro');
    if (cancelledRef.current) return;
    await playFragmentClip(ripple.id);
    if (cancelledRef.current) return;

    if (ripple.playerNumbersNeeded) {
      const playerCount = Math.max(0, config.selectedCharacters.length - 3);
      const maxN = Math.min(playerCount, MAX_PLAYER_NUMBER_FRAGMENTS);
      const numbers = pickDistinctPlayerNumbers(maxN, ripple.playerNumbersNeeded);
      for (const n of numbers) {
        if (cancelledRef.current) return;
        await playFragmentClip(playerNumberFragmentId(n));
      }
    }
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
    ensureAudioGraph();
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

      await playCharacterAudio(entry.characterId, 'activation', i);
      if (cancelledRef.current) return;

      await countdown(entry.duration);
      if (cancelledRef.current) return;

      if (!entry.skipEndAudio) {
        await playCharacterAudio(entry.characterId, 'end', i);
        if (cancelledRef.current) return;
      }

      await maybePlayRandomNoise();
      if (cancelledRef.current) return;
    }

    setGamePhase('night_end');
    await playGameAudio('night_end');
    if (cancelledRef.current) return;

    await maybePlayRipple();
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
    audioRef.current?.pause();
    backgroundMusicRef.current?.pause();
    if (currentBufferSourceRef.current) {
      try { currentBufferSourceRef.current.stop(); } catch { /* already stopped */ }
      currentBufferSourceRef.current = null;
    }
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
                    {currentCharacter.characterId === 'oracle' && (
                      <div className="oracle-ripple-prompt">
                        <p>{t('oracleRipplePrompt')}</p>
                        <div className="oracle-ripple-buttons">
                          <button
                            type="button"
                            className={`oracle-ripple-button ${oracleGuaranteedRipple ? 'active' : ''}`}
                            onClick={() => setOracleGuarantee(true)}
                          >
                            {t('yesLabel')}
                          </button>
                          <button
                            type="button"
                            className={`oracle-ripple-button ${!oracleGuaranteedRipple ? 'active' : ''}`}
                            onClick={() => setOracleGuarantee(false)}
                          >
                            {t('noLabel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
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
