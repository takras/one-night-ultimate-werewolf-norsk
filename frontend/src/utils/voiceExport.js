// Export/import of a locally recorded voice as a zip.
//
// The zip mirrors the repo's public/audio layout, so adding a contributed
// voice is: unzip the folder into frontend/public/audio, add the entry from
// voices-entry.json to src/data/voices.json, run
// `npm run generate-audio-manifest`.

import { createZip, readZip } from './zip';
import { createLocalVoice, saveLocalClip, slugify, extensionForMime } from './localVoices';

const KNOWN_TYPES = [
  'discussion_instruction',
  'discussion_end',
  'game_start',
  'night_end',
  'fragment',
  'activation',
  'end',
];

const MIME_BY_EXT = {
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

export function exportVoiceId(voice) {
  return `${slugify(voice.language)}_${slugify(voice.name)}`;
}

export async function exportVoiceZip(voice, clips, { complete }) {
  const folder = exportVoiceId(voice);
  const files = [];
  const metadata = {};

  clips.forEach((clip) => {
    const filename = `${clip.characterId}_${clip.audioType}.${clip.ext}`;
    files.push({ name: `${folder}/${filename}`, data: clip.blob });
    const meta = (metadata[clip.characterId] ||= { characterId: clip.characterId, isComplex: false });
    meta[clip.audioType] = { filename, originalName: filename, uploadedAt: clip.uploadedAt };
  });
  Object.entries(metadata).forEach(([characterId, meta]) => {
    files.push({ name: `${folder}/${characterId}.json`, data: JSON.stringify(meta, null, 2) });
  });

  files.push({
    name: `${folder}/voice.json`,
    data: JSON.stringify(
      {
        name: voice.name,
        language: voice.language,
        createdAt: voice.createdAt,
        exportedAt: new Date().toISOString(),
        clipCount: clips.length,
        complete,
      },
      null,
      2
    ),
  });
  files.push({
    name: 'voices-entry.json',
    data: JSON.stringify({ id: folder, name: voice.name, language: voice.language }, null, 2),
  });
  files.push({
    name: 'README.txt',
    data:
      `Voice "${voice.name}" (${voice.language}) - ${clips.length} clips${complete ? ', complete set' : ', INCOMPLETE set'}.\n\n` +
      `To add it to the game:\n` +
      `1. Copy the "${folder}" folder into frontend/public/audio/\n` +
      `2. Add the entry from voices-entry.json to frontend/src/data/voices.json\n` +
      `3. Run: npm run generate-audio-manifest\n`,
  });

  return { blob: await createZip(files), filename: `${folder}.zip` };
}

export async function importVoiceZip(blob) {
  const files = await readZip(blob);

  const voiceFile = files.find((f) => f.name.endsWith('voice.json'));
  let info = {};
  if (voiceFile) {
    try {
      info = JSON.parse(new TextDecoder().decode(voiceFile.data));
    } catch {
      /* fall through to folder name */
    }
  }
  const firstFolder = files.find((f) => f.name.includes('/'))?.name.split('/')[0] || 'Imported voice';
  const voice = await createLocalVoice({
    name: info.name || firstFolder,
    language: info.language || 'Unknown',
  });

  let imported = 0;
  for (const file of files) {
    const base = file.name.split('/').pop();
    const dot = base.lastIndexOf('.');
    const ext = dot >= 0 ? base.slice(dot + 1).toLowerCase() : '';
    if (!MIME_BY_EXT[ext]) continue;
    const stem = base.slice(0, dot);
    const type = KNOWN_TYPES.find((t) => stem.endsWith(`_${t}`));
    if (!type) continue;
    const characterId = stem.slice(0, -(type.length + 1));
    const mime = MIME_BY_EXT[ext];
    await saveLocalClip({
      voiceId: voice.id,
      characterId,
      audioType: type,
      blob: new Blob([file.data], { type: mime }),
    });
    imported++;
  }
  return { voice, imported, extensionForMime };
}
