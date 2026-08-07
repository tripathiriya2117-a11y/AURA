import { Router } from "express";
import { chatWithGroq } from "../providers/groq";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await chatWithGroq(message);

    res.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "Something went wrong.",
    });
  }
});

export default router;