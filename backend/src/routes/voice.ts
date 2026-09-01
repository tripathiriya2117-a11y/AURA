import express from "express";
import multer from "multer";
import fs from "fs";
import { transcribeAudio } from "../services/speechToText.service";

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, _file, cb) => {
      cb(null, `recording-${Date.now()}.m4a`);
    },
  }),
});

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Audio file is required",
    });
  }

  try {
    const text = await transcribeAudio(req.file.path);

    res.json({
      text,
    });
  } catch (error) {
    console.error("Speech transcription failed:", error);

    res.status(500).json({
      message: "Speech transcription failed",
    });
  } finally {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

export default router;