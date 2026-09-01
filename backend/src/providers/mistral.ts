import { AIProvider, Message } from "./ai.provider";

export class MistralProvider implements AIProvider {
  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Mistral API error: ${response.status} ${error}`
      );
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content ?? "";
  }
}