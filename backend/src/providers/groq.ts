import Groq from "groq-sdk";

export async function chatWithGroq(message: string) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content;
}