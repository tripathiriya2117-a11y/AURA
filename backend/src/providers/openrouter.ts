import { AIProvider, Message } from "./ai.provider";

export class OpenRouterProvider implements AIProvider {
  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `OpenRouter API error: ${response.status} ${error}`
      );
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content ?? "";
  }
}