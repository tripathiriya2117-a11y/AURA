import { Router } from "express";
import { processMessage } from "../services/conversation.service";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await processMessage(message);

    res.json({
      reply,
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "AI_PROVIDER_ERROR",
      message: "Couldn't reach Victor's brain.",
    });
  }
});

export default router;