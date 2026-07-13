import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdminPanel.css';
import { useTranslation } from '../i18n.jsx';
import { SINGLE_TARGET_FRAGMENTS, MAX_PLAYER_NUMBER_FRAGMENTS, playerNumberFragmentId } from '../data/targetFragments';
import { RIPPLE_EVENTS } from '../data/rippleEvents';
import { getCharacterScript, getFragmentScript, GAME_PHASE_SCRIPTS, NO_FIXED_SCRIPT } from '../data/narrationScripts';

// Duplicate roles (varulv_1/varulv_2, ...) share one audio entry
const baseCharacterId = (id) => id.replace(/_\d+$/, '');

export default function AdminPanel({ onClose }) {
  const { t, language } = useTranslation();
  const [characters, setCharacters] = useState([]);
  const [uploadedAudio, setUploadedAudio] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedAudioType, setSelectedAudioType] = useState('activation'); // activation, end, random_noise
  const [audioTypeCategory, setAudioTypeCategory] = useState('character'); // character, game, random, background_music
  const [gameAudioType, setGameAudioType] = useState('game_start');
  const [isComplex, setIsComplex] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [recordingState, setRecordingState] = useState('idle'); // idle, recording, stopped
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [newVoiceName, setNewVoiceName] = useState('');
  const [addingVoice, setAddingVoice] = useState(false);
  const [selectedFragment, setSelectedFragment] = useState('');

  // Character/game-phase/fragment audio belongs to a voice; random noise
  // and background music are shared across voices
  const isVoiceScoped = audioTypeCategory === 'character' || audioTypeCategory === 'game' || audioTypeCategory === 'fragment';

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const previewRef = useRef(new Audio());

  useEffect(() => {
    fetchCharacters();
    fetchUploadedAudio();
    fetchVoices();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await axios.get('/api/characters');
      setCharacters(response.data);
      if (response.data.length > 0) {
        setSelectedCharacter(baseCharacterId(response.data[0].id));
      }
    } catch (err) {
      setMessage(t('failedLoadCharacters'));
    }
  };

  const fetchUploadedAudio = async () => {
    try {
      const response = await axios.get('/api/audio');
      setUploadedAudio(response.data);
    } catch (err) {
      console.warn('Failed to fetch uploaded audio:', err);
    }
  };

  const fetchVoices = async () => {
    try {
      const response = await axios.get('/api/voices');
      setVoices(response.data);
      if (response.data.length > 0) {
        setSelectedVoice(prev => prev || response.data[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch voices:', err);
    }
  };

  const addVoice = async () => {
    if (!newVoiceName.trim()) return;
    try {
      setAddingVoice(true);
      const response = await axios.post('/api/voices', { name: newVoiceName.trim() });
      setNewVoiceName('');
      await fetchVoices();
      setSelectedVoice(response.data.id);
      setMessage(t('voiceAdded', { name: response.data.name }));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(t('voiceAddFailed') + (err.response?.data?.error || err.message));
    } finally {
      setAddingVoice(false);
    }
  };

  const startRecording = async () => {
    try {
      setMessage('');
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setMessage(t('recordingCompleted'));
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      setMessage(t('recordingMessage'));
    } catch (err) {
      setMessage(t('micError') + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setRecordingState('stopped');
    }
  };

  const previewRecording = () => {
    if (recordedBlob) {
      previewRef.current.src = URL.createObjectURL(recordedBlob);
      previewRef.current.play();
    }
  };

  const uploadAudio = async (audioBlob = null, fileName = null) => {
    try {
      let characterId;
      let audioType;

      if (isVoiceScoped && !selectedVoice) {
        setMessage(t('selectVoiceFirst'));
        return;
      }

      if (audioTypeCategory === 'character') {
        if (!selectedCharacter) {
          setMessage(t('selectCharacterFirst'));
          return;
        }
        characterId = selectedCharacter;
        audioType = selectedAudioType;
      } else if (audioTypeCategory === 'game') {
        characterId = gameAudioType; // game_start, night_end, discussion_instruction, discussion_end
        audioType = gameAudioType;
      } else if (audioTypeCategory === 'fragment') {
        if (!selectedFragment) {
          setMessage(t('selectFragmentFirst'));
          return;
        }
        characterId = selectedFragment;
        audioType = 'fragment';
      } else if (audioTypeCategory === 'random') {
        // For random noises, use random_noise_{timestamp}
        characterId = `random_noise_${Date.now()}`;
        audioType = 'random_noise';
      } else if (audioTypeCategory === 'background_music') {
        // Multiple tracks can be uploaded; each gets its own timestamp id
        characterId = `background_music_${Date.now()}`;
        audioType = 'background_music';
      }

      setUploading(true);
      setMessage(t('uploadingMessage'));

      const formData = new FormData();
      formData.append('characterId', characterId);
      formData.append('audioType', audioType);
      if (isVoiceScoped) {
        formData.append('voiceId', selectedVoice);
      }
      if (audioTypeCategory === 'character') {
        formData.append('isComplex', isComplex);
      }

      if (audioBlob) {
        formData.append('audio', audioBlob, fileName || 'audio.webm');
      } else if (recordedBlob) {
        formData.append('audio', recordedBlob, 'recording.webm');
      } else {
        setMessage(t('noAudioToUpload'));
        setUploading(false);
        return;
      }

      const response = await axios.post('/api/audio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedName = audioTypeCategory === 'random' ? t('randomNoiseName') :
                          audioTypeCategory === 'background_music' ? t('backgroundMusicName') :
                          audioTypeCategory === 'game' ? gameAudioType :
                          audioTypeCategory === 'fragment' ? selectedFragment :
                          getCharacterName(selectedCharacter);
      setMessage(t('audioUploadedFor', { type: selectedAudioType, name: uploadedName }));
      setRecordedBlob(null);
      setRecordingState('idle');
      if (audioTypeCategory === 'character') {
        setIsComplex(false);
      }
      fetchUploadedAudio();

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(t('uploadFailed') + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAudio(file, file.name);
    }
  };

  const deleteAudio = async (characterId, audioType, voiceId = null) => {
    if (!confirm(t('deleteConfirm', { name: getCharacterName(characterId) }))) return;
    try {
      const query = voiceId ? `?voiceId=${encodeURIComponent(voiceId)}` : '';
      await axios.delete(`/api/audio/${encodeURIComponent(characterId)}/${encodeURIComponent(audioType)}${query}`);
      setMessage(t('deleteSuccess', { name: getCharacterName(characterId) }));
      fetchUploadedAudio();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(t('deleteFailed') + (err.response?.data?.error || err.message));
    }
  };

  const displayName = (char) =>
    language === 'no' ? char.norwegianName : (char.name || char.norwegianName);

  const getCharacterName = (id) => {
    // Audio is stored under the group id, so match on base id as well;
    // audio variants (e.g. dobbeltgjenger_undersaatt) have their own ids
    const char = characters.find(c => c.id === id)
      || characters.flatMap(c => c.audioVariants || []).find(v => v.id === id)
      || characters.find(c => baseCharacterId(c.id) === id);
    return char ? displayName(char) : id;
  };

  // ✅ when both activation and end audio exist for the selected voice, ⚠️ otherwise
  const characterAudioStatus = (groupId) => {
    const hasActivation = uploadedAudio.some(a => a.characterId === groupId && a.audioType === 'activation' && a.voiceId === selectedVoice);
    const hasEnd = uploadedAudio.some(a => a.characterId === groupId && a.audioType === 'end' && a.voiceId === selectedVoice);
    return hasActivation && hasEnd ? '✅' : '⚠️';
  };

  // ✅ when a fragment clip exists for the selected voice, ⚠️ otherwise
  const fragmentAudioStatus = (fragmentId) => {
    const hasFragment = uploadedAudio.some(a => a.characterId === fragmentId && a.audioType === 'fragment' && a.voiceId === selectedVoice);
    return hasFragment ? '✅' : '⚠️';
  };

  const fragmentLabel = (fragmentId) => {
    const target = SINGLE_TARGET_FRAGMENTS.find(f => f.id === fragmentId);
    if (target) return target.norwegianLabel;
    const ripple = RIPPLE_EVENTS.find(r => r.id === fragmentId);
    if (ripple) return ripple.norwegianLabel;
    const playerMatch = fragmentId.match(/^player_(\d+)$/);
    if (playerMatch) return `${t('playerNumbersGroupLabel')} ${playerMatch[1]}`;
    return fragmentId;
  };

  // Script text for whatever is currently selected in the form above, so
  // the narrator knows what to say before hitting record
  const currentScript = () => {
    if (audioTypeCategory === 'character') {
      if (!selectedCharacter) return null;
      return getCharacterScript(selectedCharacter, selectedAudioType);
    }
    if (audioTypeCategory === 'game') {
      return GAME_PHASE_SCRIPTS[gameAudioType] || null;
    }
    if (audioTypeCategory === 'fragment') {
      if (!selectedFragment) return null;
      return getFragmentScript(selectedFragment);
    }
    if (audioTypeCategory === 'random' || audioTypeCategory === 'background_music') {
      return NO_FIXED_SCRIPT;
    }
    return null;
  };

  const trackTitle = (audio, idx) => {
    if (audio.originalName) return audio.originalName.replace(/\.[^.]+$/, '');
    if (audio.filename) return audio.filename.replace(/\.[^.]+$/, '');
    return `#${idx + 1}`;
  };

  // One dropdown entry per role: duplicates like varulv_1/varulv_2 collapse
  // into a single group that shares audio and plays once during the night.
  // Roles without a night action (Villager, Tanner, Bodyguard) need no audio.
  // Audio variants (Doppelgänger's situational clips, conditional on other
  // selected roles) and narration variants (Rascal/Alien/etc's randomly
  // weighted-picked alternatives) each get their own entries, inheriting
  // the parent character's games since neither has its own.
  const groupedCharacters = [];
  const seenGroups = new Set();
  characters.forEach(char => {
    if (char.noNightAction) return;
    const groupId = baseCharacterId(char.id);
    if (seenGroups.has(groupId)) return;
    seenGroups.add(groupId);
    groupedCharacters.push({ ...char, id: groupId });
    (char.audioVariants || []).forEach(variant => {
      seenGroups.add(variant.id);
      groupedCharacters.push({ ...variant, games: char.games });
    });
    (char.narrationVariants || []).forEach(variant => {
      seenGroups.add(variant.id);
      groupedCharacters.push({ ...variant, games: char.games });
    });
  });

  // Crossover characters (e.g. Varulv, in both Werewolf and Daybreak) are
  // grouped under their first-listed game so they only appear once
  const GAME_ORDER = ['werewolf', 'daybreak', 'alien'];
  const charactersByGame = { werewolf: [], daybreak: [], alien: [] };
  groupedCharacters.forEach(char => {
    const primaryGame = (char.games && char.games[0]) || 'werewolf';
    (charactersByGame[primaryGame] || (charactersByGame[primaryGame] = [])).push(char);
  });

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-header">
          <h2>{t('audioManagement')}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="admin-content">
          {/* Recording Section */}
          <section className="admin-section recording-section">
            <h3>{t('recordOrUpload')}</h3>

            <div className="form-group">
              <label>{t('audioCategory')}</label>
              <select 
                value={audioTypeCategory}
                onChange={(e) => setAudioTypeCategory(e.target.value)}
                disabled={recordingState === 'recording' || uploading}
              >
                <option value="character">{t('characterAudioOption')}</option>
                <option value="game">{t('gamePhaseAudioOption')}</option>
                <option value="fragment">{t('fragmentAudioOption')}</option>
                <option value="random">{t('randomNoisesOption')}</option>
                <option value="background_music">{t('backgroundMusicOption')}</option>
              </select>
            </div>

            {isVoiceScoped && (
              <div className="form-group">
                <label>{t('selectVoiceLabel')}</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  disabled={recordingState === 'recording' || uploading}
                >
                  {voices.length === 0 && <option value="">{t('noVoicesYet')}</option>}
                  {voices.map(voice => (
                    <option key={voice.id} value={voice.id}>{voice.name}</option>
                  ))}
                </select>
                <div className="add-voice-row">
                  <input
                    type="text"
                    value={newVoiceName}
                    onChange={(e) => setNewVoiceName(e.target.value)}
                    placeholder={t('newVoiceNamePlaceholder')}
                    disabled={addingVoice}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addVoice}
                    disabled={addingVoice || !newVoiceName.trim()}
                  >
                    {t('addVoiceButton')}
                  </button>
                </div>
              </div>
            )}

            {audioTypeCategory === 'character' && (
              <>
                <div className="form-group">
                  <label>{t('selectCharacterLabel')}</label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) => {
                      setSelectedCharacter(e.target.value);
                      // Always start from Activation for the newly picked
                      // role, rather than keeping whatever type was
                      // selected for the previous role
                      setSelectedAudioType('activation');
                    }}
                    disabled={recordingState === 'recording' || uploading}
                  >
                    <option value="">{t('selectCharacterPlaceholder')}</option>
                    {GAME_ORDER.map(gameId => charactersByGame[gameId].length > 0 && (
                      <optgroup key={gameId} label={t(`game_${gameId}`)}>
                        {charactersByGame[gameId].map(char => (
                          <option key={char.id} value={char.id}>
                            {characterAudioStatus(char.id)} {displayName(char)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('audioTypeLabel')}</label>
                  <select 
                    value={selectedAudioType}
                    onChange={(e) => setSelectedAudioType(e.target.value)}
                    disabled={recordingState === 'recording' || uploading}
                  >
                    <option value="activation">{t('activationOption')}</option>
                    <option value="end">{t('endOption')}</option>
                  </select>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox"
                      checked={isComplex}
                      onChange={(e) => setIsComplex(e.target.checked)}
                      disabled={recordingState === 'recording' || uploading}
                    />
                    <span>{t('complexCharacterOption')}</span>
                  </label>
                </div>
              </>
            )}

            {audioTypeCategory === 'game' && (
              <div className="form-group">
                <label>{t('gamePhaseLabel')}</label>
                <select 
                  value={gameAudioType}
                  onChange={(e) => setGameAudioType(e.target.value)}
                  disabled={recordingState === 'recording' || uploading}
                >
                  <option value="game_start">{t('gameStartOption')}</option>
                  <option value="night_end">{t('nightEndOption')}</option>
                  <option value="discussion_instruction">{t('discussionInstructionOption')}</option>
                  <option value="discussion_end">{t('discussionEndOption')}</option>
                </select>
              </div>
            )}

            {audioTypeCategory === 'fragment' && (
              <>
                <div className="form-group">
                  <label>{t('selectFragmentLabel')}</label>
                  <select
                    value={selectedFragment}
                    onChange={(e) => setSelectedFragment(e.target.value)}
                    disabled={recordingState === 'recording' || uploading}
                  >
                    <option value="">{t('selectFragmentPlaceholder')}</option>
                    <optgroup label={t('targetPhrasesGroupLabel')}>
                      {SINGLE_TARGET_FRAGMENTS.map(fragment => (
                        <option key={fragment.id} value={fragment.id}>
                          {fragmentAudioStatus(fragment.id)} {fragment.norwegianLabel}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={t('playerNumbersGroupLabel')}>
                      {Array.from({ length: MAX_PLAYER_NUMBER_FRAGMENTS }, (_, i) => i + 1).map(n => {
                        const fragmentId = playerNumberFragmentId(n);
                        return (
                          <option key={fragmentId} value={fragmentId}>
                            {fragmentAudioStatus(fragmentId)} {n}
                          </option>
                        );
                      })}
                    </optgroup>
                    <optgroup label={t('rippleEventsGroupLabel')}>
                      {RIPPLE_EVENTS.map(ripple => (
                        <option key={ripple.id} value={ripple.id}>
                          {fragmentAudioStatus(ripple.id)} {ripple.norwegianLabel}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="info-box">
                  <p>{t('fragmentInfo')}</p>
                </div>
              </>
            )}

            {audioTypeCategory === 'random' && (
              <div className="info-box">
                <p>{t('randomNoiseInfo')}</p>
              </div>
            )}

            {audioTypeCategory === 'background_music' && (
              <div className="info-box">
                <p>{t('backgroundMusicInfo')}</p>
              </div>
            )}

            {currentScript() && (
              <div className="form-group">
                <label>{t('scriptLabel')}</label>
                <div className="script-box">{currentScript()}</div>
              </div>
            )}

            {/* Recording Controls */}
            <div className="recording-controls">
              {recordingState === 'idle' && !recordedBlob && (
                <button 
                  className="btn btn-primary"
                  onClick={startRecording}
                  disabled={uploading}
                >
                  {t('startRecording')}
                </button>
              )}

              {recordingState === 'recording' && (
                <button 
                  className="btn btn-danger"
                  onClick={stopRecording}
                >
                  {t('stopRecording')}
                </button>
              )}

              {recordedBlob && (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={previewRecording}
                  >
                    {t('previewButton')}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => uploadAudio()}
                    disabled={uploading}
                  >
                    {uploading ? t('uploadingButton') : t('uploadRecording')}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setRecordedBlob(null);
                      setRecordingState('idle');
                    }}
                  >
                    {t('newRecording')}
                  </button>
                </>
              )}
            </div>

            {/* File Upload */}
            <div className="file-upload">
              <label htmlFor="file-input" className="file-label">
                {t('chooseFile')}
              </label>
              <input 
                id="file-input"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={recordingState === 'recording' || uploading}
              />
            </div>

            {/* Status Message */}
            {message && (
              <div className={`message ${message.includes('✓') ? 'success' : 'info'}`}>
                {message}
              </div>
            )}
          </section>

          {/* Uploaded Audio List */}
          <section className="admin-section audio-list-section">
            <h3>{t('uploadedAudioFiles')}</h3>
            {uploadedAudio.length > 0 ? (
              <div className="audio-list">
                {(() => {
                  // Separate audio by category; character/game audio is
                  // further scoped to whichever voice is currently selected
                  const characterAudio = {};
                  const gameAudio = {};
                  const fragmentAudio = [];
                  const randomNoise = [];
                  const backgroundMusic = [];

                  uploadedAudio
                    .filter(audio => !isVoiceScoped || audio.voiceId === selectedVoice)
                    .forEach(audio => {
                      if (audio.audioType === 'random_noise') {
                        randomNoise.push(audio);
                      } else if (audio.audioType === 'background_music') {
                        backgroundMusic.push(audio);
                      } else if (audio.audioType === 'fragment') {
                        fragmentAudio.push(audio);
                      } else if (['game_start', 'night_end', 'discussion_instruction', 'discussion_end'].includes(audio.audioType)) {
                        if (!gameAudio[audio.audioType]) {
                          gameAudio[audio.audioType] = [];
                        }
                        gameAudio[audio.audioType].push(audio);
                      } else {
                        // Character audio
                        if (!characterAudio[audio.characterId]) {
                          characterAudio[audio.characterId] = [];
                        }
                        characterAudio[audio.characterId].push(audio);
                      }
                    });

                  // Only show the category selected in the form above
                  const visibleCount = audioTypeCategory === 'character'
                    ? Object.keys(characterAudio).length
                    : audioTypeCategory === 'game'
                      ? Object.keys(gameAudio).length
                      : audioTypeCategory === 'fragment'
                        ? fragmentAudio.length
                        : audioTypeCategory === 'background_music'
                          ? backgroundMusic.length
                          : randomNoise.length;

                  return (
                    <>
                      {visibleCount === 0 && (
                        <p className="no-audio">{t('noAudioUploaded')}</p>
                      )}

                      {/* Game Phase Audio */}
                      {audioTypeCategory === 'game' && Object.keys(gameAudio).length > 0 && (
                        <div className="audio-category">
                          <h4>{t('gamePhaseAudioHeader')}</h4>
                          {Object.entries(gameAudio).map(([type, audios]) => (
                            <div key={type} className="audio-item">
                              <div className="audio-info">
                                <h5>{{
                                  game_start: t('gameStartOption'),
                                  night_end: t('nightEndOption'),
                                  discussion_instruction: t('discussionInstructionOption'),
                                  discussion_end: t('discussionEndOption')
                                }[type] || type}</h5>
                              </div>
                              <div className="audio-actions">
                                {audios.map((audio, idx) => (
                                  <div key={idx} className="audio-action-item">
                                    <button 
                                      className="btn-small btn-preview"
                                      onClick={() => {
                                        previewRef.current.src = audio.url;
                                        previewRef.current.play();
                                      }}
                                      title={t('previewAudioTitle')}
                                    >
                                      🔊
                                    </button>
                                    <button
                                      className="btn-small btn-delete"
                                      onClick={() => deleteAudio(audio.characterId, audio.audioType, selectedVoice)}
                                      title={t('deleteAudioTitle')}
                                    >
                                      🗑️
                                    </button>
                                    <span className="uploaded-date">
                                      {new Date(audio.uploadedAt).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Character Audio */}
                      {audioTypeCategory === 'character' && Object.keys(characterAudio).length > 0 && (
                        <div className="audio-category">
                          <h4>{t('characterAudioHeader')}</h4>
                          {Object.entries(characterAudio).map(([characterId, audios]) => (
                            <div key={characterId} className="audio-item">
                              <div className="audio-info">
                                <h5>{getCharacterName(characterId)}</h5>
                                <p className="character-id">{characterId}</p>
                                {audios[0]?.isComplex && (
                                  <span className="badge complex-badge">{t('complexBadge')}</span>
                                )}
                              </div>
                              <div className="audio-types">
                                {['activation', 'end'].map(type => {
                                  const audio = audios.find(a => a.audioType === type);
                                  return (
                                    <div key={type} className="audio-type-item">
                                      <span className="type-label">{type === 'activation' ? '🎬' : '⏹️'} {type}</span>
                                      {audio ? (
                                        <div className="audio-actions">
                                          <button 
                                            className="btn-small btn-preview"
                                            onClick={() => {
                                              previewRef.current.src = audio.url;
                                              previewRef.current.play();
                                            }}
                                            title={t('previewAudioTitle')}
                                          >
                                            🔊
                                          </button>
                                          <button
                                            className="btn-small btn-delete"
                                            onClick={() => deleteAudio(audio.characterId, type, selectedVoice)}
                                            title={t('deleteAudioTitle')}
                                          >
                                            🗑️
                                          </button>
                                          <span className="uploaded-date">
                                            {new Date(audio.uploadedAt).toLocaleString()}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="not-uploaded">{t('notUploaded')}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Target Fragments */}
                      {audioTypeCategory === 'fragment' && fragmentAudio.length > 0 && (
                        <div className="audio-category">
                          <h4>{t('fragmentsHeader')} ({fragmentAudio.length})</h4>
                          <div className="audio-item">
                            <div className="audio-list-inline">
                              {fragmentAudio.map((audio, idx) => (
                                <div key={idx} className="audio-item-inline">
                                  <span
                                    className="noise-title"
                                    title={audio.uploadedAt ? new Date(audio.uploadedAt).toLocaleString() : undefined}
                                  >
                                    {fragmentLabel(audio.characterId)}
                                  </span>
                                  <button
                                    className="btn-small btn-preview"
                                    onClick={() => {
                                      previewRef.current.src = audio.url;
                                      previewRef.current.play();
                                    }}
                                    title={t('previewAudioTitle')}
                                  >
                                    🔊
                                  </button>
                                  <button
                                    className="btn-small btn-delete"
                                    onClick={() => deleteAudio(audio.characterId, audio.audioType, selectedVoice)}
                                    title={t('deleteAudioTitle')}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Random Noises */}
                      {audioTypeCategory === 'random' && randomNoise.length > 0 && (
                        <div className="audio-category">
                          <h4>{t('randomNoisesHeader')} ({randomNoise.length})</h4>
                          <div className="audio-item">
                            <div className="audio-list-inline">
                              {randomNoise.map((audio, idx) => (
                                <div key={idx} className="audio-item-inline">
                                  <span
                                    className="noise-title"
                                    title={audio.uploadedAt ? new Date(audio.uploadedAt).toLocaleString() : undefined}
                                  >
                                    {trackTitle(audio, idx)}
                                  </span>
                                  <button
                                    className="btn-small btn-preview"
                                    onClick={() => {
                                      previewRef.current.src = audio.url;
                                      previewRef.current.play();
                                    }}
                                    title={t('previewAudioTitle')}
                                  >
                                    🔊
                                  </button>
                                  <button 
                                    className="btn-small btn-delete"
                                    onClick={() => deleteAudio(audio.characterId, audio.audioType)}
                                    title={t('deleteAudioTitle')}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Background Music */}
                      {audioTypeCategory === 'background_music' && backgroundMusic.length > 0 && (
                        <div className="audio-category">
                          <h4>{t('backgroundMusicHeader')} ({backgroundMusic.length})</h4>
                          <div className="audio-item">
                            <div className="audio-list-inline">
                              {backgroundMusic.map((audio, idx) => (
                                <div key={idx} className="audio-item-inline">
                                  <span
                                    className="noise-title"
                                    title={audio.uploadedAt ? new Date(audio.uploadedAt).toLocaleString() : undefined}
                                  >
                                    {trackTitle(audio, idx)}
                                  </span>
                                  <button
                                    className="btn-small btn-preview"
                                    onClick={() => {
                                      previewRef.current.src = audio.url;
                                      previewRef.current.play();
                                    }}
                                    title={t('previewAudioTitle')}
                                  >
                                    🔊
                                  </button>
                                  <button
                                    className="btn-small btn-delete"
                                    onClick={() => deleteAudio(audio.characterId, audio.audioType)}
                                    title={t('deleteAudioTitle')}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="no-audio">{t('noAudioUploaded')}</p>
            )}
          </section>
        </div>
      </div>

      <audio ref={previewRef} crossOrigin="anonymous" />
    </div>
  );
}
