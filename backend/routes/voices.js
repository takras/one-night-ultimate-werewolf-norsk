import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Same file the frontend bundles directly - one source of truth
const voicesPath = join(__dirname, "../../frontend/src/data/voices.json");
const audioDir = join(__dirname, "../../frontend/public/audio");

function readVoices() {
  if (!fs.existsSync(voicesPath)) return [];
  return JSON.parse(fs.readFileSync(voicesPath, "utf-8"));
}

function writeVoices(voices) {
  fs.writeFileSync(voicesPath, JSON.stringify(voices, null, 2) + "\n");
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // strip accents/diacritics
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "voice"
  );
}

// GET all voices
router.get("/", (req, res) => {
  try {
    res.json(readVoices());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new voice
router.post("/", (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Voice name is required" });
    }

    const voices = readVoices();
    const base = slugify(name.trim());
    let id = base;
    let suffix = 2;
    while (voices.some((v) => v.id === id)) {
      id = `${base}_${suffix}`;
      suffix += 1;
    }

    const voice = { id, name: name.trim() };
    voices.push(voice);
    writeVoices(voices);

    const voiceDir = join(audioDir, id);
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }

    res.json(voice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
