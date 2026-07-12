import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Single source of truth lives with the frontend build so it can be bundled
// into the static (GitHub Pages) site; the admin panel just reads the same file
const characterConfigPath = join(__dirname, "../../frontend/src/data/characters.json");
const characterConfig = JSON.parse(
  fs.readFileSync(characterConfigPath, "utf-8"),
);

// GET all characters
router.get("/", (req, res) => {
  res.json(characterConfig.characters);
});

// GET single character
router.get("/:characterId", (req, res) => {
  const character = characterConfig.characters.find(
    (c) => c.id === req.params.characterId,
  );
  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }
  res.json(character);
});

export default router;
