import Groq from "groq-sdk";
import fs from "fs";

export async function transcribeAudio(
  audioPath: string
): Promise<string> {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const transcription =
    await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3-turbo",
    });

  return transcription.text;
}