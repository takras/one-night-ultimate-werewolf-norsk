// Voices and recordings that live only on the user's own device (IndexedDB).
// Nothing here ever touches a server: contributors record their own voice for
// a language, and export it as a zip (see zip.js / VoiceStudio) to send in.
//
// A local voice looks like { id, name, language, createdAt }. A clip is one
// recording: { key, voiceId, characterId, audioType, blob, ext, uploadedAt },
// where characterId/audioType follow the same naming as the files in
// public/audio, so the same catalog code can play them.

const DB_NAME = 'one-night-voices';
const DB_VERSION = 1;

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore('voices', { keyPath: 'id' });
        const clips = db.createObjectStore('clips', { keyPath: 'key' });
        clips.createIndex('voiceId', 'voiceId');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

// Runs one request against a store and resolves with its result
async function run(storeName, mode, makeRequest) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = makeRequest(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(request ? request.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'voice'
  );
}

const EXT_BY_MIME = [
  ['webm', 'webm'],
  ['ogg', 'ogg'],
  ['mp4', 'm4a'],
  ['m4a', 'm4a'],
  ['aac', 'm4a'],
  ['mpeg', 'mp3'],
  ['mp3', 'mp3'],
  ['wav', 'wav'],
];

export function extensionForMime(mime = '') {
  const found = EXT_BY_MIME.find(([needle]) => mime.includes(needle));
  return found ? found[1] : 'webm';
}

const clipKey = (voiceId, characterId, audioType) => `${voiceId}/${characterId}/${audioType}`;

// ---- voices ----------------------------------------------------------

export async function listLocalVoices() {
  try {
    return await run('voices', 'readonly', (s) => s.getAll());
  } catch {
    return [];
  }
}

export async function createLocalVoice({ name, language }) {
  const id = `local_${slugify(language)}_${slugify(name)}_${Date.now().toString(36)}`;
  const voice = { id, name: name.trim(), language: language.trim(), createdAt: new Date().toISOString() };
  await run('voices', 'readwrite', (s) => s.put(voice));
  return voice;
}

export async function updateLocalVoice(voice) {
  await run('voices', 'readwrite', (s) => s.put(voice));
}

export async function deleteLocalVoice(voiceId) {
  const clips = await listLocalClips(voiceId);
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(['voices', 'clips'], 'readwrite');
    tx.objectStore('voices').delete(voiceId);
    clips.forEach((c) => tx.objectStore('clips').delete(c.key));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  clips.forEach((c) => revokeUrl(c.key));
}

// ---- clips -----------------------------------------------------------

export async function listLocalClips(voiceId) {
  try {
    const all = await run('clips', 'readonly', (s) => (voiceId ? s.index('voiceId').getAll(voiceId) : s.getAll()));
    return all;
  } catch {
    return [];
  }
}

export async function saveLocalClip({ voiceId, characterId, audioType, blob }) {
  const key = clipKey(voiceId, characterId, audioType);
  const clip = {
    key,
    voiceId,
    characterId,
    audioType,
    blob,
    ext: extensionForMime(blob.type),
    uploadedAt: new Date().toISOString(),
  };
  await run('clips', 'readwrite', (s) => s.put(clip));
  revokeUrl(key);
  return clip;
}

export async function deleteLocalClip(voiceId, characterId, audioType) {
  const key = clipKey(voiceId, characterId, audioType);
  await run('clips', 'readwrite', (s) => s.delete(key));
  revokeUrl(key);
}

// Asks the browser not to evict this origin's storage under pressure. It's a
// request, not a guarantee (Safari may still clear unused sites), which is
// why the export-to-zip backup exists.
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* not supported */
  }
  return false;
}

// ---- catalog (same entry shape as audioManifest.json / GET /api/audio) ----

const urlCache = new Map(); // key -> { url, uploadedAt }

function revokeUrl(key) {
  const cached = urlCache.get(key);
  if (cached) {
    URL.revokeObjectURL(cached.url);
    urlCache.delete(key);
  }
}

export function clipUrl(clip) {
  const cached = urlCache.get(clip.key);
  if (cached && cached.uploadedAt === clip.uploadedAt) return cached.url;
  if (cached) URL.revokeObjectURL(cached.url);
  const url = URL.createObjectURL(clip.blob);
  urlCache.set(clip.key, { url, uploadedAt: clip.uploadedAt });
  return url;
}

export async function getLocalCatalog() {
  const clips = await listLocalClips();
  return clips.map((clip) => ({
    characterId: clip.characterId,
    audioType: clip.audioType,
    voiceId: clip.voiceId,
    filename: `${clip.characterId}_${clip.audioType}.${clip.ext}`,
    url: clipUrl(clip),
    isComplex: false,
    uploadedAt: clip.uploadedAt,
    originalName: null,
    local: true,
  }));
}
