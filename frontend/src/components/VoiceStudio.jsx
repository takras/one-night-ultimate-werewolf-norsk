import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './VoiceStudio.css';
import { useTranslation } from '../i18n.jsx';
import { buildRequiredSections, clipKey } from '../data/requiredClips';
import {
  listLocalVoices,
  createLocalVoice,
  deleteLocalVoice,
  listLocalClips,
  saveLocalClip,
  deleteLocalClip,
  clipUrl,
  requestPersistentStorage,
} from '../utils/localVoices';
import { exportVoiceZip, importVoiceZip } from '../utils/voiceExport';

const LANGUAGES = [
  'Norwegian', 'English', 'Swedish', 'Danish', 'Finnish', 'Icelandic', 'German', 'Dutch', 'French',
  'Spanish', 'Portuguese', 'Italian', 'Polish', 'Czech', 'Russian', 'Ukrainian', 'Turkish', 'Japanese',
  'Korean', 'Chinese',
];

const TEXT = {
  en: {
    title: 'Record your own voice',
    close: 'Close',
    intro:
      'Record every line in your own language. Everything stays on this device (your browser\'s storage) - nothing is uploaded. When the set is complete you can download it as a zip file and send it in. Read the English text and say it naturally in your language; the grey note is context and is not read aloud.',
    storageWarning:
      'Browsers can clear stored data, especially Safari after a week without use. Download the zip regularly as a backup.',
    yourVoices: 'Your voices',
    noVoices: 'No voices yet - create one below.',
    newVoice: 'New voice',
    language: 'Language you record in',
    voiceName: 'Voice name (e.g. "Anna")',
    create: 'Create voice',
    deleteVoice: 'Delete voice',
    confirmDeleteVoice: 'Delete this voice and all of its recordings from this device?',
    importZip: 'Import a voice zip',
    importDone: (n) => `Imported ${n} recordings.`,
    importFailed: 'Could not read that zip file: ',
    progress: (done, total) => `${done} of ${total} recordings`,
    download: 'Download zip',
    downloadIncomplete: 'Download zip (incomplete)',
    confirmIncomplete: 'This voice is not complete yet. Download what you have so far?',
    record: 'Record',
    stop: 'Stop',
    play: 'Play',
    upload: 'Upload file',
    remove: 'Delete',
    micDenied: 'Could not use the microphone: ',
    sectionDone: (d, t) => `${d}/${t}`,
    voiceTab: 'Voice',
    useInGame: 'This voice also appears in the voice list on the start screen, so you can try it in a game.',
  },
  no: {
    title: 'Spill inn din egen stemme',
    close: 'Lukk',
    intro:
      'Spill inn hver replikk på ditt eget språk. Alt blir liggende på denne enheten (nettleserens lagring) - ingenting lastes opp. Når settet er komplett kan du laste det ned som en zip-fil og sende det inn. Les den engelske teksten og si den naturlig på ditt språk; den grå teksten er bakgrunn og leses ikke opp.',
    storageWarning:
      'Nettlesere kan slette lagrede data, særlig Safari etter en uke uten bruk. Last ned zip-filen jevnlig som sikkerhetskopi.',
    yourVoices: 'Dine stemmer',
    noVoices: 'Ingen stemmer ennå - lag en under.',
    newVoice: 'Ny stemme',
    language: 'Språket du spiller inn på',
    voiceName: 'Navn på stemmen (f.eks. "Anna")',
    create: 'Lag stemme',
    deleteVoice: 'Slett stemme',
    confirmDeleteVoice: 'Slette denne stemmen og alle opptakene fra denne enheten?',
    importZip: 'Importer en stemme-zip',
    importDone: (n) => `Importerte ${n} opptak.`,
    importFailed: 'Kunne ikke lese zip-filen: ',
    progress: (done, total) => `${done} av ${total} opptak`,
    download: 'Last ned zip',
    downloadIncomplete: 'Last ned zip (ufullstendig)',
    confirmIncomplete: 'Stemmen er ikke ferdig ennå. Laste ned det du har så langt?',
    record: 'Ta opp',
    stop: 'Stopp',
    play: 'Spill av',
    upload: 'Last opp fil',
    remove: 'Slett',
    micDenied: 'Kunne ikke bruke mikrofonen: ',
    sectionDone: (d, t) => `${d}/${t}`,
    voiceTab: 'Stemme',
    useInGame: 'Stemmen dukker også opp i stemmelisten på startsiden, så du kan prøve den i et spill.',
  },
};

function pickRecorderMime() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
}

export default function VoiceStudio({ onClose }) {
  const { language } = useTranslation();
  const L = TEXT[language === 'no' ? 'no' : 'en'];
  const sections = useMemo(() => buildRequiredSections(), []);
  const allClips = useMemo(() => sections.flatMap((s) => s.clips), [sections]);

  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [clips, setClips] = useState([]); // stored clips for the selected voice
  const [newLanguage, setNewLanguage] = useState('');
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');
  const [recordingKey, setRecordingKey] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const playerRef = useRef(null);
  const importInputRef = useRef(null);
  const uploadTargetRef = useRef(null);
  const uploadInputRef = useRef(null);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || null;

  const refreshVoices = useCallback(async (selectId) => {
    const list = await listLocalVoices();
    setVoices(list);
    setSelectedVoiceId((prev) => selectId || (list.some((v) => v.id === prev) ? prev : list[0]?.id || ''));
  }, []);

  const refreshClips = useCallback(async (voiceId) => {
    setClips(voiceId ? await listLocalClips(voiceId) : []);
  }, []);

  useEffect(() => {
    refreshVoices();
    requestPersistentStorage();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      playerRef.current?.pause();
    };
  }, [refreshVoices]);

  useEffect(() => {
    refreshClips(selectedVoiceId);
  }, [selectedVoiceId, refreshClips]);

  const clipMap = useMemo(() => {
    const map = new Map();
    clips.forEach((c) => map.set(`${c.characterId}/${c.audioType}`, c));
    return map;
  }, [clips]);

  const doneCount = allClips.filter((c) => clipMap.has(clipKey(c))).length;
  const complete = doneCount === allClips.length;

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newLanguage.trim()) return;
    const voice = await createLocalVoice({ name: newName, language: newLanguage });
    setNewName('');
    await refreshVoices(voice.id);
  };

  const handleDeleteVoice = async () => {
    if (!selectedVoice || !confirm(L.confirmDeleteVoice)) return;
    await deleteLocalVoice(selectedVoice.id);
    await refreshVoices();
  };

  const store = async (clip, blob) => {
    await saveLocalClip({ voiceId: selectedVoiceId, characterId: clip.id, audioType: clip.type, blob });
    await refreshClips(selectedVoiceId);
  };

  const startRecording = async (clip) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecordingKey(null);
        if (chunks.length) await store(clip, new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecordingKey(clipKey(clip));
    } catch (err) {
      flash(L.micDenied + err.message);
    }
  };

  const stopRecording = () => recorderRef.current?.stop();

  const play = (clip) => {
    const stored = clipMap.get(clipKey(clip));
    if (!stored) return;
    playerRef.current?.pause();
    playerRef.current = new Audio(clipUrl(stored));
    playerRef.current.play().catch(() => {});
  };

  const remove = async (clip) => {
    await deleteLocalClip(selectedVoiceId, clip.id, clip.type);
    await refreshClips(selectedVoiceId);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    const clip = uploadTargetRef.current;
    e.target.value = '';
    if (file && clip) await store(clip, new Blob([file], { type: file.type || 'audio/mpeg' }));
  };

  const handleDownload = async () => {
    if (!selectedVoice) return;
    if (!complete && !confirm(L.confirmIncomplete)) return;
    const { blob, filename } = await exportVoiceZip(selectedVoice, clips, { complete });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { voice, imported } = await importVoiceZip(file);
      await refreshVoices(voice.id);
      flash(L.importDone(imported));
    } catch (err) {
      flash(L.importFailed + err.message);
    }
  };

  return (
    <div className="voice-studio">
      <div className="voice-studio-header">
        <h2>{L.title}</h2>
        <button className="vs-close" onClick={onClose}>{L.close}</button>
      </div>

      <p className="vs-intro">{L.intro}</p>
      <p className="vs-warning">{L.storageWarning}</p>
      {message && <div className="vs-message">{message}</div>}

      <section className="vs-card">
        <h3>{L.yourVoices}</h3>
        {voices.length === 0 ? (
          <p className="vs-muted">{L.noVoices}</p>
        ) : (
          <div className="vs-row">
            <select value={selectedVoiceId} onChange={(e) => setSelectedVoiceId(e.target.value)}>
              {voices.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.language})</option>
              ))}
            </select>
            <button className="vs-btn vs-danger" onClick={handleDeleteVoice}>{L.deleteVoice}</button>
          </div>
        )}

        <form className="vs-form" onSubmit={handleCreate}>
          <h4>{L.newVoice}</h4>
          <label>
            {L.language}
            <input
              list="vs-languages"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              required
            />
            <datalist id="vs-languages">
              {LANGUAGES.map((l) => <option key={l} value={l} />)}
            </datalist>
          </label>
          <label>
            {L.voiceName}
            <input value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </label>
          <button type="submit" className="vs-btn">{L.create}</button>
        </form>

        <div className="vs-row">
          <button className="vs-btn" onClick={() => importInputRef.current?.click()}>{L.importZip}</button>
          <input ref={importInputRef} type="file" accept=".zip,application/zip" hidden onChange={handleImport} />
        </div>
        <p className="vs-muted">{L.useInGame}</p>
      </section>

      {selectedVoice && (
        <>
          <section className="vs-card vs-sticky">
            <div className="vs-progress-label">{L.progress(doneCount, allClips.length)}</div>
            <div className="vs-progress"><div style={{ width: `${(doneCount / allClips.length) * 100}%` }} /></div>
            <button className="vs-btn vs-primary" onClick={handleDownload} disabled={clips.length === 0}>
              {complete ? L.download : L.downloadIncomplete}
            </button>
          </section>

          {sections.map((section) => {
            const done = section.clips.filter((c) => clipMap.has(clipKey(c))).length;
            return (
              <details key={section.id} className="vs-section">
                <summary>
                  {done === section.clips.length ? '✅' : '🎙️'} {section.title}{' '}
                  <span className="vs-muted">{L.sectionDone(done, section.clips.length)}</span>
                </summary>
                {section.clips.map((clip) => {
                  const key = clipKey(clip);
                  const stored = clipMap.has(key);
                  const isRecording = recordingKey === key;
                  return (
                    <div key={key} className={`vs-clip ${stored ? 'done' : ''}`}>
                      <div className="vs-clip-text">
                        <div className="vs-clip-label">{stored ? '✅' : '⚪'} {clip.label}</div>
                        <div className="vs-say">{clip.say}</div>
                        {clip.note && <div className="vs-note">{clip.note}</div>}
                      </div>
                      <div className="vs-clip-actions">
                        {isRecording ? (
                          <button className="vs-btn vs-danger" onClick={stopRecording}>⏹ {L.stop}</button>
                        ) : (
                          <button className="vs-btn" disabled={recordingKey !== null} onClick={() => startRecording(clip)}>
                            ● {L.record}
                          </button>
                        )}
                        {stored && !isRecording && (
                          <>
                            <button className="vs-btn" onClick={() => play(clip)}>▶ {L.play}</button>
                            <button className="vs-btn" onClick={() => remove(clip)}>🗑️</button>
                          </>
                        )}
                        {!isRecording && (
                          <button
                            className="vs-btn"
                            onClick={() => { uploadTargetRef.current = clip; uploadInputRef.current?.click(); }}
                          >
                            ⬆ {L.upload}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </details>
            );
          })}
          <input ref={uploadInputRef} type="file" accept="audio/*" hidden onChange={handleUploadFile} />
        </>
      )}
    </div>
  );
}
