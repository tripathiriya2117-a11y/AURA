import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat";
import {
  getPlanets,
  getPlanetContext,
} from "./services/auraAppService";
import planetRoute from "./routes/planet";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("chatRoute", chatRoute);
console.log("type =", typeof chatRoute);

app.use("/chat", chatRoute);

app.get("/", (_, res) => {
  res.json({
    message: "Aura backend is alive!",
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

app.listen(3000, () => {
  console.log("🚀 Aura backend running");
});