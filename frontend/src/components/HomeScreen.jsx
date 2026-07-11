import { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeScreen.css';
import { useTranslation } from '../i18n.jsx';
import { rolePresets } from '../data/rolePresets';

// Group presets by the player count they produce (cards - 3 center cards)
const presetsByPlayerCount = rolePresets.reduce((acc, preset) => {
  (acc[preset.playerCount] ||= []).push(preset);
  return acc;
}, {});
const presetPlayerCounts = Object.keys(presetsByPlayerCount).map(Number).sort((a, b) => a - b);

export default function HomeScreen({ onStartGame }) {
  const { t, language } = useTranslation();

  const displayName = (char) =>
    language === 'no' ? char.norwegianName : (char.name || char.norwegianName);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [duration, setDuration] = useState(5);
  const [discussionDuration, setDiscussionDuration] = useState(120);
  const [complexCharacters, setComplexCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presetPlayerCount, setPresetPlayerCount] = useState(presetPlayerCounts[0]);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/characters');
      setCharacters(response.data);
    } catch (err) {
      setError(t('failedLoadCharacters'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  // 3 cards go to the center, so players = selected characters - 3
  const playerCount = Math.max(0, selectedCharacters.length - 3);
  const canStart = selectedCharacters.length >= 4;

  const handleStartGame = () => {
    if (canStart) {
      onStartGame(selectedCharacters, duration, complexCharacters, discussionDuration);
    }
  };

  if (loading) {
    return <div className="home-screen loading">{t('loadingCharacters')}</div>;
  }

  if (error) {
    return <div className="home-screen error">{error}</div>;
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        <section className="settings-panel">
          <h2>{t('gameSettings')}</h2>

          <div className="setting-group">
            <label>{t('presetsTitle')}</label>
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
              {presetsByPlayerCount[presetPlayerCount].map((preset, idx) => (
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
          <div className="grid">
            {characters.map(character => (
              <div 
                key={character.id}
                className={`character-card ${selectedCharacters.includes(character.id) ? 'selected' : ''}`}
                onClick={() => toggleCharacter(character.id)}
              >
                <div className="character-image">
                  <img
                    src={`/karakterer/${character.image}`}
                    alt={displayName(character)}
                    onError={(e) => {
                      e.target.src = '/karakterer/livvakt.webp';
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
