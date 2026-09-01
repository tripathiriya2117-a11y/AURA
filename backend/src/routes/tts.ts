import { Router } from "express";

const router = Router();

const KOKORO_URL = "http://127.0.0.1:8880";

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "INVALID_TEXT",
        message: "Text is required.",
      });
    }

    console.log("Kokoro TTS:", text);

    const response = await fetch(`${KOKORO_URL}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Kokoro TTS error:", errorText);

      return res.status(500).json({
        error: "TTS_ERROR",
        message: errorText,
      });
    }

    const audioBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": audioBuffer.length.toString(),
    });

    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS ERROR:", error);

    return res.status(500).json({
      error: "TTS_ERROR",
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

export default router;