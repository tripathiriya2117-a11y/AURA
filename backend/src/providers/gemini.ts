import { AIProvider, Message } from "./ai.provider";

export class GeminiProvider implements AIProvider {
  async chat(messages: Message[]): Promise<string> {
    const systemMessage = messages.find(
      (message) => message.role === "system"
    );

    const contents = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: message.content,
          },
        ],
      }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
        },
        body: JSON.stringify({
          ...(systemMessage && {
            systemInstruction: {
              parts: [
                {
                  text: systemMessage.content,
                },
              ],
            },
          }),
          contents,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Gemini API error: ${response.status} ${error}`
      );
    }

    const data = await response.json();

    return (
      data.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text ?? "")
        .join("") ?? ""
    );
  }
}