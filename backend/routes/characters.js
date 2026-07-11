import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Load characters configuration
const characterConfigPath = join(__dirname, "../config/characters.json");
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

// POST calculate play order based on selected characters
router.post("/play-order", (req, res) => {
  try {
    const { selectedCharacterIds, durationSeconds, complexCharacters } =
      req.body;

    if (!selectedCharacterIds || !Array.isArray(selectedCharacterIds)) {
      return res
        .status(400)
        .json({ error: "selectedCharacterIds must be an array" });
    }

    const playOrder = buildPlayOrder(
      selectedCharacterIds,
      durationSeconds || 5,
      complexCharacters || [],
    );
    res.json({
      order: playOrder,
      playerCount: selectedCharacterIds.length - 3,
      totalDuration: calculateTotalDuration(playOrder),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Duplicate roles (varulv_1/varulv_2, frimurer_1/2, ...) share one group id
function baseCharacterId(id) {
  return id.replace(/_\d+$/, "");
}

// Doppelgänger records separate audio per game situation (minion phase,
// wake-ups after Insomniac/Exposer/Curator), declared as audioVariants
function findAudioVariant(variantId) {
  for (const character of characterConfig.characters) {
    const variant = (character.audioVariants || []).find(
      (v) => v.id === variantId,
    );
    if (variant) return variant;
  }
  return null;
}

// Build play order from selected characters
function buildPlayOrder(selectedIds, baseDuration, complexCharacters) {
  const order = [];
  const selectedSet = new Set(selectedIds);
  const addedGroups = new Set();

  // Iterate through play order positions
  characterConfig.playOrder.forEach((entry) => {
    const position = entry.position;
    const characterIds = entry.characterIds || [entry.characterId];

    // Add all selected characters at this position; duplicates of the same
    // role (e.g. two Werewolves) get a single entry and play their audio once
    characterIds.forEach((charId) => {
      if (selectedSet.has(charId)) {
        const groupId = baseCharacterId(charId);
        if (addedGroups.has(groupId)) return;
        addedGroups.add(groupId);

        const character = characterConfig.characters.find(
          (c) => c.id === charId,
        );
        const isComplex = characterIds
          .filter((id) => baseCharacterId(id) === groupId && selectedSet.has(id))
          .some((id) => complexCharacters.includes(id));
        const duration = isComplex ? baseDuration * 2 : baseDuration;

        order.push({
          characterId: groupId,
          characterName: character.norwegianName,
          characterNameEnglish: character.name,
          image: character.image,
          position: position,
          duration: duration,
          isComplex: isComplex,
        });

        // Doppelgänger + Minion: the base slot keeps its normal activation,
        // but the minion phase audio replaces the normal end and gets its
        // own end audio afterwards (3 audio clips in total)
        if (charId === "dobbeltgjenger" && selectedSet.has("undersaatt")) {
          order[order.length - 1].skipEndAudio = true;
          const variant = findAudioVariant("dobbeltgjenger_undersaatt");
          order.push({
            characterId: "dobbeltgjenger_undersaatt",
            characterName: variant?.norwegianName || "Dobbeltgjenger: Undersått-fase",
            characterNameEnglish: variant?.name || "Doppelgänger: Minion phase",
            image: character.image,
            position: position,
            duration: duration,
            isComplex: isComplex,
          });
        }
      }
    });

    // Handle Dobbeltgjenger conditional positioning
    if (entry.conditionalNext && selectedSet.has("dobbeltgjenger")) {
      const characterId = entry.characterId;
      if (selectedSet.has(characterId)) {
        const character = characterConfig.characters.find(
          (c) => c.id === "dobbeltgjenger",
        );
        const target = characterConfig.characters.find(
          (c) => c.id === characterId,
        );
        const isComplex = complexCharacters.includes("dobbeltgjenger");
        const duration = isComplex ? baseDuration * 2 : baseDuration;

        // Each conditional wake-up has its own recorded audio
        const variantId = `dobbeltgjenger_${characterId}`;
        const variant = findAudioVariant(variantId);

        order.push({
          characterId: variantId,
          characterName: variant?.norwegianName || `${character.norwegianName}-${target.norwegianName}`,
          characterNameEnglish: variant?.name || `${character.name}-${target.name}`,
          image: character.image,
          position: position,
          duration: duration,
          isComplex: isComplex,
          variant: characterId,
        });
      }
    }
  });

  return order;
}

// Calculate total duration in seconds
function calculateTotalDuration(playOrder) {
  return playOrder.reduce((total, entry) => total + entry.duration, 0);
}

export default router;
