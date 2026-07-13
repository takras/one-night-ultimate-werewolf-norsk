import { useState, useEffect } from 'react';
import './HomeScreen.css';
import { useTranslation } from '../i18n.jsx';
import { rolePresets } from '../data/rolePresets';
import { getCharacters } from '../utils/playOrder';
import { assetUrl } from '../utils/assetUrl';
import { getVoices } from '../data/voicesCatalog';
import { unlockAudioContext } from '../utils/audioContext';

// Static bundle data - no backend needed, works on GitHub Pages
const allCharacters = getCharacters();

const GAMES = [
  { id: 'werewolf', image: 'games/werewolf.png' },
  { id: 'daybreak', image: 'games/daybreak.png' },
  { id: 'alien', image: 'games/alien.png' },
];

export default function HomeScreen({ onStartGame }) {
  const { t, language } = useTranslation();

  const displayName = (char) =>
    language === 'no' ? char.norwegianName : (char.name || char.norwegianName);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [duration, setDuration] = useState(5);
  const [discussionDuration, setDiscussionDuration] = useState(120);
  const [complexCharacters, setComplexCharacters] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedGames, setSelectedGames] = useState(['werewolf']);

  // Only offer presets whose every character belongs to a currently active
  // game - a preset with even one role from a deselected game is dropped
  const availablePresets = rolePresets.filter(preset =>
    preset.characterIds.every(id => {
      const character = allCharacters.find(c => c.id === id);
      return character && (character.games || []).some(g => selectedGames.includes(g));
    })
  );
  const presetsByPlayerCount = availablePresets.reduce((acc, preset) => {
    (acc[preset.playerCount] ||= []).push(preset);
    return acc;
  }, {});
  const presetPlayerCounts = Object.keys(presetsByPlayerCount).map(Number).sort((a, b) => a - b);

  const [presetPlayerCount, setPresetPlayerCount] = useState(presetPlayerCounts[0]);

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

  const toggleCharacter = (characterId) => {
    setSelectedCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
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
    setComplexCharacters([]);
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
  // this is what makes Werewolf/Landsbyboer crossovers appear under either
  const filteredCharacters = allCharacters.filter(character =>
    (character.games || []).some(g => selectedGames.includes(g))
  );

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

          {filteredCharacters.length === 0 && (
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
        </section>
      </div>
    </div>
  );
}
