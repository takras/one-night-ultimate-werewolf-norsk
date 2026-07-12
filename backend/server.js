import express from "express";
import cors from "cors";
import characterRoutes from "./routes/characters.js";
import audioRoutes from "./routes/audio.js";
import gameRoutes from "./routes/game.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API Routes
app.use("/api/characters", characterRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/game", gameRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

app.listen(PORT, () => {
  console.log(
    `One Night Werewolf backend running on http://localhost:${PORT}`,
  );
});
