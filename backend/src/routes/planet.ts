import { Router } from "express";
import { getPlanetContext } from "../services/planet.service";

const router = Router();

router.get("/:planetId", async (req, res) => {
  try {
    const planet = await getPlanetContext(req.params.planetId);

    res.json(planet);
  } catch (error) {
    console.error("Planet fetch failed:", error);

    res.status(500).json({
      message: "Couldn't retrieve Planet data.",
    });
  }
});

export default router;