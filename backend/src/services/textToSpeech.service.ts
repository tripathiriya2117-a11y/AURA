import { HumeClient } from "hume";

const apiKey = process.env.HUME_API_KEY;
const voiceId = process.env.HUME_VOICE_ID;

if (!apiKey) {
  throw new Error("HUME_API_KEY is missing");
}

if (!voiceId) {
  throw new Error("HUME_VOICE_ID is missing");
}

const hume = new HumeClient({
  apiKey,
});

export async function synthesizeVictor(
  text: string
): Promise<Buffer> {
  const response = await hume.tts.synthesizeFile({
    version: "2",

    format: {
      type: "wav",
    },

    stripHeaders: true,

    utterances: [
      {
        text,

        voice: {
          id: voiceId!,
          provider: "CUSTOM_VOICE",
        },
      },
    ],
  });

  return Buffer.from(await response.arrayBuffer());
}