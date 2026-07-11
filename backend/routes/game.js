import express from "express";

const router = express.Router();

// GET game status
router.get("/status", (req, res) => {
  res.json({
    status: "ready",
    message: "Game service is available",
  });
});

// POST initialize new game
router.post("/initialize", (req, res) => {
  try {
    const { selectedCharacterIds, durationSeconds, complexCharacters } =
      req.body;

    if (
      !selectedCharacterIds ||
      !Array.isArray(selectedCharacterIds) ||
      selectedCharacterIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "At least one character must be selected" });
    }

    res.json({
      gameId: Date.now().toString(),
      selectedCharacters: selectedCharacterIds,
      playerCount: selectedCharacterIds.length + 3,
      settings: {
        durationSeconds: durationSeconds || 5,
        complexCharacters: complexCharacters || [],
      },
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
