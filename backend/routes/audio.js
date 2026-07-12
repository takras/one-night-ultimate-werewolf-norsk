import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
// Lives inside the frontend's public/ dir so Vite serves it directly (dev
// and the static production build both get it for free, no proxy needed)
const audioDir = join(__dirname, "../../frontend/public/audio");

// Ensure audio directory exists
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Multer configuration for audio uploads
const upload = multer({
  dest: audioDir,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/webm"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Known audio type suffixes, longest first so e.g. "night_end" wins over "end"
const knownAudioTypes = [
  "discussion_instruction",
  "discussion_end",
  "background_music",
  "random_noise",
  "game_start",
  "night_end",
  "activation",
  "end",
];

// Character/game-phase narration belongs to a voice (a subfolder of
// audioDir); random noises and background music are shared across voices
// and live at the root of audioDir
const VOICE_SCOPED_TYPES = [
  "activation",
  "end",
  "game_start",
  "night_end",
  "discussion_instruction",
  "discussion_end",
];

// Browsers can only decode PCM (1) and IEEE float (3) WAV data - reject
// anything else (e.g. ADPCM) at upload time instead of silently storing a
// file that will fail to play in the game
function findUnsupportedWavFormat(filePath) {
  const header = Buffer.alloc(44);
  const fd = fs.openSync(filePath, "r");
  try {
    fs.readSync(fd, header, 0, 44, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (header.toString("ascii", 0, 4) !== "RIFF" || header.toString("ascii", 8, 12) !== "WAVE") {
    return null; // not a WAV file, nothing to check
  }
  const formatTag = header.readUInt16LE(20);
  return formatTag === 1 || formatTag === 3 ? null : formatTag;
}

function parseAudioFilename(file) {
  const basename = path.parse(file).name;
  let characterId = basename;
  let audioType = "activation";
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
  return name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".m4a") || name.endsWith(".webm");
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
        metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      }

      return {
        characterId,
        audioType,
        voiceId: voiceId || null,
        filename: file,
        url: voiceId ? `/audio/${voiceId}/${file}` : `/audio/${file}`,
        ...metadata,
        // Per-type details (nested under the type key in metadata) flattened;
        // older metadata stored uploadedAt at the top level
        uploadedAt: metadata[audioType]?.uploadedAt || metadata.uploadedAt || null,
        originalName: metadata[audioType]?.originalName || null,
      };
    });
}

function listAudioFiles() {
  const results = listDir(audioDir, null);

  const topLevel = fs.readdirSync(audioDir, { withFileTypes: true });
  topLevel
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      results.push(...listDir(join(audioDir, entry.name), entry.name));
    });

  return results;
}

// POST upload or record audio for a character
router.post("/upload", upload.single("audio"), (req, res) => {
  try {
    const { characterId, isComplex, audioType, voiceId } = req.body;
    const type = audioType || "activation"; // Default to activation for backward compatibility

    if (!characterId || !req.file) {
      return res
        .status(400)
        .json({ error: "characterId and audio file required" });
    }

    if (VOICE_SCOPED_TYPES.includes(type) && !voiceId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "voiceId is required for character/game-phase audio" });
    }

    const unsupportedFormat = findUnsupportedWavFormat(req.file.path);
    if (unsupportedFormat !== null) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: `Unsupported WAV encoding (format code ${unsupportedFormat}). Browsers can only play PCM WAV files - re-export as standard PCM WAV or MP3.`,
      });
    }

    const targetDir = voiceId ? join(audioDir, voiceId) : audioDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Rename file to characterId with type suffix
    const fileExt = path.extname(req.file.originalname) || ".mp3";
    const newFilename = `${characterId}_${type}${fileExt}`;
    const newPath = join(targetDir, newFilename);

    fs.renameSync(req.file.path, newPath);

    // Store metadata
    const metadataPath = join(targetDir, `${characterId}.json`);
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    }
    metadata.characterId = characterId;
    metadata.isComplex = isComplex === "true" || isComplex === true;
    metadata[type] = {
      filename: newFilename,
      originalName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({
      success: true,
      message: "Audio uploaded successfully",
      characterId,
      audioType: type,
      voiceId: voiceId || null,
      filename: newFilename,
      metadata,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET list all available audio files
router.get("/", (req, res) => {
  try {
    res.json(listAudioFiles());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a specific audio clip (characterId + audioType [+ voiceId] combination)
router.delete("/:characterId/:audioType", (req, res) => {
  try {
    const { characterId, audioType } = req.params;
    const voiceId = req.query.voiceId || null;
    const match = listAudioFiles().find(
      (a) => a.characterId === characterId && a.audioType === audioType && a.voiceId === voiceId,
    );

    if (!match) {
      return res.status(404).json({ error: "Audio file not found" });
    }

    const dir = voiceId ? join(audioDir, voiceId) : audioDir;
    fs.unlinkSync(join(dir, match.filename));

    const metadataPath = join(dir, `${characterId}.json`);
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      delete metadata[audioType];
      const hasOtherTypes = Object.keys(metadata).some(
        (key) => !["characterId", "isComplex"].includes(key),
      );
      if (hasOtherTypes) {
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      } else {
        fs.unlinkSync(metadataPath);
      }
    }

    res.json({ success: true, characterId, audioType, voiceId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
