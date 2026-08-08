import Groq from "groq-sdk";
import { AIProvider, Message } from "./ai.provider";

export class GroqProvider implements AIProvider {
  async chat(messages: Message[]): Promise<string> {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
    });

    return completion.choices[0].message.content ?? "";
  }
}