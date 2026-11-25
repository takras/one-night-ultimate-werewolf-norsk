import { useState, useEffect } from 'react';
import './HomeScreen.css';
import { useTranslation } from '../i18n.jsx';
import { rolePresets } from '../data/rolePresets';
import { getCharacters } from '../utils/playOrder';
import { assetUrl } from '../utils/assetUrl';
import { getVoices } from '../data/voicesCatalog';
import { getAudioCatalog } from '../data/audioCatalog';
import { unlockAudioContext } from '../utils/audioContext';

// Static bundle data - no backend needed, works on GitHub Pages
const allCharacters = getCharacters();

// Same grouping the play order uses: duplicates (varulv_1/varulv_2) share
// one recording under the base id
// Zerb shares Groob's single wake-up (one recording, one night step)
const baseCharacterId = (id) => (id === 'zerb' ? 'groob_alien' : id.replace(/_\d+$/, ''));

// A role is playable with a voice when that voice has an activation clip for
// it - either the role's own clip, or (for roles whose narration is picked
// among variants, e.g. Alien or Oracle) a clip for at least one variant.
// Roles with no night action need no recording at all. Until the catalog and voice have
// loaded nothing is treated as missing, to avoid a flash of greyed-out
// cards.
function hasRecording(character, audioCatalog, voiceId, allCharacters = []) {
  if (character.noNightAction || !audioCatalog || !voiceId) return true;
  // Duplicates of a role (alien_1/alien_2) share one recording, which may
  // be filed under the variants of whichever copy declares them
  const group = baseCharacterId(character.id);
  const variants = allCharacters
    .filter(c => baseCharacterId(c.id) === group)
    .flatMap(c => c.narrationVariants || []);
  const ids = new Set([group, ...variants.map(v => v.id)]);
  return audioCatalog.some(
    a => ids.has(a.characterId) && a.audioType === 'activation' && a.voiceId === voiceId
  );
}

const GAMES = [
  { id: 'werewolf', image: 'games/werewolf.png' },
  { id: 'daybreak', image: 'games/daybreak.png' },
  { id: 'alien', image: 'games/alien.png' },
];

export default function HomeScreen({
  onStartGame,
  selectedCharacters,
  onSelectedCharactersChange: setSelectedCharacters,
  complexCharacters,
  onComplexCharactersChange: setComplexCharacters,
  selectedGames,
  onSelectedGamesChange: setSelectedGames,
}) {
  const { t, language } = useTranslation();

  const displayName = (char) =>
    language === 'no' ? char.norwegianName : (char.name || char.norwegianName);
  const [duration, setDuration] = useState(5);
  const [discussionDuration, setDiscussionDuration] = useState(120);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [audioCatalog, setAudioCatalog] = useState(null);

  const isMissing = (character) => !hasRecording(character, audioCatalog, selectedVoiceId, allCharacters);

  // Only offer presets whose every character belongs to a currently active
  // game - a preset with even one role from a deselected game is dropped
  const availablePresets = rolePresets.filter(preset =>
    preset.characterIds.every(id => {
      const character = allCharacters.find(c => c.id === id);
      return character && (character.games || []).some(g => selectedGames.includes(g)) && !isMissing(character);
    })
  );
  const presetsByPlayerCount = availablePresets.reduce((acc, preset) => {
    (acc[preset.playerCount] ||= []).push(preset);
    return acc;
  }, {});
  const presetPlayerCounts = Object.keys(presetsByPlayerCount).map(Number).sort((a, b) => a - b);

  const [presetPlayerCount, setPresetPlayerCount] = useState(presetPlayerCounts[0]);

  useEffect(() => {
    getAudioCatalog().then(setAudioCatalog);
  }, []);

  // Changing voice (or the catalog loading) can make selected roles
  // unplayable - drop them from the selection instead of starting a game
  // that would stay silent for them
  useEffect(() => {
    if (!audioCatalog || !selectedVoiceId) return;
    const missingIds = new Set(allCharacters.filter(isMissing).map(c => c.id));
    if (missingIds.size === 0) return;
    setSelectedCharacters(prev => (prev.some(id => missingIds.has(id)) ? prev.filter(id => !missingIds.has(id)) : prev));
    setComplexCharacters(prev => (prev.some(id => missingIds.has(id)) ? prev.filter(id => !missingIds.has(id)) : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioCatalog, selectedVoiceId]);

  useEffect(() => {
    getVoices().then(list => {
      setVoices(list);
      setSelectedVoiceId(prev => prev || list[0]?.id || '');
    });
  }, []);

  // Keep the active preset tab valid as the game filter changes the
  // available presets (e.g. switch to another tab, or none if empty)
  useEffect(() => {
    if (presetPlayerCounts.length > 0 && !presetPlayerCounts.includes(presetPlayerCount)) {
      setPresetPlayerCount(presetPlayerCounts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGames]);

  // Roles flagged defaultComplex (Doppelgänger, Paranormal Investigator,
  // Oracle, Groob/Zerb) start with "double time" on when selected; it can
  // still be switched off per role afterwards
  const isDefaultComplex = (id) => !!allCharacters.find(c => c.id === id)?.defaultComplex;

  const toggleCharacter = (characterId) => {
    const adding = !selectedCharacters.includes(characterId);
    setSelectedCharacters(prev =>
      prev.includes(characterId) ? prev.filter(id => id !== characterId) : [...prev, characterId]
    );
    if (adding && isDefaultComplex(characterId)) {
      setComplexCharacters(prev => (prev.includes(characterId) ? prev : [...prev, characterId]));
    } else if (!adding) {
      setComplexCharacters(prev => prev.filter(id => id !== characterId));
    }
  };

  const toggleComplex = (characterId) => {
    setComplexCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  const applyPreset = (preset) => {
    setSelectedCharacters(preset.characterIds);
    setComplexCharacters(preset.characterIds.filter(isDefaultComplex));
  };

  const toggleGame = (gameId) => {
    const next = selectedGames.includes(gameId)
      ? selectedGames.filter(g => g !== gameId)
      : [...selectedGames, gameId];
    setSelectedGames(next);

    // Deselecting a game also drops any selected characters that no longer
    // belong to any active game (crossovers like Varulv stay selected as
    // long as one of their games - e.g. Daybreak - is still active)
    const stillVisible = (id) => {
      const character = allCharacters.find(c => c.id === id);
      return character && (character.games || []).some(g => next.includes(g));
    };
    setSelectedCharacters(prev => prev.filter(stillVisible));
    setComplexCharacters(prev => prev.filter(stillVisible));
  };

  // A character shows up if it belongs to any currently-selected game -
  // this is what makes Werewolf/Landsbyboer crossovers appear under either.
  // Sorted by translated (display) name so the grid order follows whichever
  // language is active.
  const visibleCharacters = allCharacters
    .filter(character => (character.games || []).some(g => selectedGames.includes(g)))
    .sort((a, b) => displayName(a).localeCompare(displayName(b), language === 'no' ? 'nb' : 'en'));
  // Roles without a recording for the chosen voice can't be played, so they
  // move to their own greyed-out, unselectable section below the rest
  const filteredCharacters = visibleCharacters.filter(c => !isMissing(c));
  const missingCharacters = visibleCharacters.filter(isMissing);

  // 3 cards go to the center, so players = selected characters - 3
  const playerCount = Math.max(0, selectedCharacters.length - 3);
  const canStart = selectedCharacters.length >= 4;

  const handleStartGame = () => {
    if (canStart) {
      // Must happen synchronously inside this click handler - iOS only
      // allows unlocking audio playback/volume control from a real gesture
      unlockAudioContext();
      onStartGame(selectedCharacters, duration, complexCharacters, discussionDuration, selectedVoiceId);
    }
  };

  return (
    <div className="home-screen">
      <div className="home-content">
        <section className="settings-panel">
          <h2>{t('gameSettings')}</h2>

          <div className="setting-group">
            <label>{t('presetsTitle')}</label>
            {presetPlayerCounts.length === 0 ? (
              <p className="no-presets-match">{t('noPresetsMatchFilter')}</p>
            ) : (
              <>
                <div className="preset-player-tabs">
                  {presetPlayerCounts.map(count => (
                    <button
                      key={count}
                      type="button"
                      className={`preset-tab ${presetPlayerCount === count ? 'active' : ''}`}
                      onClick={() => setPresetPlayerCount(count)}
                    >
                      {t('presetsPlayerCount', { count })}
                    </button>
                  ))}
                </div>
                <div className="preset-variant-buttons">
                  {(presetsByPlayerCount[presetPlayerCount] || []).map((preset, idx) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="preset-variant-button"
                      onClick={() => applyPreset(preset)}
                    >
                      {t('presetButtonLabel', { n: idx + 1 })}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="setting-group">
            <label>{t('durationPerCharacter')} <strong>{duration}s</strong></label>
            <input 
              type="range" 
              min="2" 
              max="15" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="setting-group">
            <label>{t('discussionDurationLabel')} <strong>{discussionDuration}s</strong> {t('maxFiveMin')}</label>
            <input 
              type="range" 
              min="30" 
              max="300" 
              value={discussionDuration}
              onChange={(e) => setDiscussionDuration(parseInt(e.target.value))}
              className="slider"
            />
          </div>

          {voices.length > 0 && (
            <div className="setting-group">
              <label>{t('chooseVoiceTitle')}</label>
              <select
                className="voice-select"
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
              >
                {voices.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="start-button-container">
            <button
              className={`start-button ${canStart ? 'enabled' : 'disabled'}`}
              onClick={handleStartGame}
              disabled={!canStart}
            >
              <span className="button-label">{t('startGame')}</span>
              <span className="player-count">
                {canStart ? t('playersCount', { count: playerCount }) : t('selectMoreRoles')}
              </span>
            </button>
          </div>

          <div className="selection-info">
            <p><strong>{t('selectedLabel')}</strong> {selectedCharacters.length} {t('rolesSuffix')}</p>
            <p><strong>{t('totalPlayers')}</strong> {playerCount}</p>
          </div>
        </section>

        <section className="character-grid">
          <h2>{t('selectRoles')} ({selectedCharacters.length})</h2>

          <div className="game-filter">
            {GAMES.map(game => (
              <button
                key={game.id}
                type="button"
                className={`game-filter-button ${selectedGames.includes(game.id) ? 'active' : ''}`}
                onClick={() => toggleGame(game.id)}
                title={t(`game_${game.id}`)}
              >
                <img src={assetUrl(game.image)} alt={t(`game_${game.id}`)} />
              </button>
            ))}
          </div>

          {visibleCharacters.length === 0 && (
            <p className="no-roles-match">{t('noRolesMatchFilter')}</p>
          )}

          <div className="grid">
            {filteredCharacters.map(character => (
              <div
                key={character.id}
                className={`character-card ${selectedCharacters.includes(character.id) ? 'selected' : ''}`}
                onClick={() => toggleCharacter(character.id)}
              >
                <div className="character-image">
                  <img
                    src={assetUrl(`karakterer/${character.image}`)}
                    alt={displayName(character)}
                    onError={(e) => {
                      e.target.src = assetUrl('karakterer/livvakt.webp');
                    }}
                  />
                </div>
                <div className="character-info">
                  <h3>{displayName(character)}</h3>
                </div>

                {selectedCharacters.includes(character.id) && (
                  <div className="complexity-toggle">
                    <label>
                      <input 
                        type="checkbox"
                        checked={complexCharacters.includes(character.id)}
                        onChange={() => toggleComplex(character.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>{t('doubleTime')}</span>
                    </label>
                  </div>
                )}

                {selectedCharacters.includes(character.id) && (
                  <div className="selection-badge">✓</div>
                )}
              </div>
            ))}
          </div>

          {missingCharacters.length > 0 && (
            <>
              <h3 className="missing-recording-header">{t('missingRecordingHeader')} ({missingCharacters.length})</h3>
              <div className="grid">
                {missingCharacters.map(character => (
                  <div key={character.id} className="character-card missing" aria-disabled="true">
                    <div className="character-image">
                      <img
                        src={assetUrl(`karakterer/${character.image}`)}
                        alt={displayName(character)}
                        onError={(e) => {
                          e.target.src = assetUrl('karakterer/livvakt.webp');
                        }}
                      />
                    </div>
                    <div className="character-info">
                      <h3>{displayName(character)}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
