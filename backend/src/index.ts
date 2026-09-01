import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import voiceRoute from "./routes/voice";
import chatRoute from "./routes/chat";
import planetRoute from "./routes/planet";
import ttsRouter from "./routes/tts";

import { getPinterestAccount } from "./services/pinterestService";

import {
  getPlanets,
  getPlanetContext,
} from "./services/auraAppService";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/planets", planetRoute);
app.use("/chat", chatRoute);
app.use("/voice", voiceRoute);
app.use("/tts", ttsRouter);

app.get("/", (_, res) => {
  res.json({
    message: "Victor backend is alive!",
  });
});

app.get("/aura-app/planets", async (_, res) => {
  try {
    const planets = await getPlanets();

    res.json({
      success: true,
      planets,
    });
  } catch (error) {
    console.error(
      "Failed to fetch aura-app planets:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch planets from aura-app",
    });
  }
});

app.get(
  "/aura-app/planets/:planetId/context",
  async (req, res) => {
    try {
      const context = await getPlanetContext(
        req.params.planetId
      );

      res.json({
        success: true,
        context,
      });
    } catch (error) {
      console.error(
        "Failed to fetch planet context:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch planet context",
      });
    }
  }
);

const PORT = Number(process.env.PORT) || 3000;

app.get("/pinterest/test", async (_, res) => {
  try {
    const account = await getPinterestAccount();

    res.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("Pinterest test failed:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Pinterest API request failed",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Victor backend running on port ${PORT}`);
});