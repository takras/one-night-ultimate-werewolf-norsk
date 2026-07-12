// Scans public/audio/ and writes src/data/audioManifest.json, a static
// snapshot of the same shape the backend's GET /api/audio returns. This is
// what the game reads from when there's no backend to talk to (the GitHub
// Pages build). Mirrors the parsing rules in backend/routes/audio.js -
// keep the two in sync if the audio filename convention ever changes.
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const audioDir = join(__dirname, '../public/audio');
const outputPath = join(__dirname, '../src/data/audioManifest.json');

const knownAudioTypes = [
  'discussion_instruction',
  'discussion_end',
  'background_music',
  'random_noise',
  'game_start',
  'night_end',
  'activation',
  'end',
];

function parseAudioFilename(file) {
  const basename = path.parse(file).name;
  let characterId = basename;
  let audioType = 'activation';
  for (const type of knownAudioTypes) {
    if (basename.endsWith(`_${type}`)) {
      characterId = basename.slice(0, -(type.length + 1));
      audioType = type;
      break;
    }
  }
  return { characterId, audioType };
}

function isAudioFile(name) {
  return name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a') || name.endsWith('.webm');
}

// Lists one directory's audio files (non-recursive); voiceId is null for
// the shared root (random noise / background music)
function listDir(dir, voiceId) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isAudioFile(entry.name))
    .map((entry) => {
      const file = entry.name;
      const { characterId, audioType } = parseAudioFilename(file);

      const metadataPath = join(dir, `${characterId}.json`);
      let metadata = {};
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      }

      return {
        characterId,
        audioType,
        voiceId: voiceId || null,
        filename: file,
        url: voiceId ? `/audio/${voiceId}/${file}` : `/audio/${file}`,
        ...metadata,
        uploadedAt: metadata[audioType]?.uploadedAt || metadata.uploadedAt || null,
        originalName: metadata[audioType]?.originalName || null,
      };
    });
}

function generateManifest() {
  if (!fs.existsSync(audioDir)) {
    fs.writeFileSync(outputPath, '[]\n');
    console.log('No public/audio directory found; wrote empty manifest.');
    return;
  }

  const manifest = listDir(audioDir, null);

  fs.readdirSync(audioDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      manifest.push(...listDir(join(audioDir, entry.name), entry.name));
    });

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote ${manifest.length} audio entries to src/data/audioManifest.json`);
}

generateManifest();
