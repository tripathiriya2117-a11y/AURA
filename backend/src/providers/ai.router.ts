import { AIProvider, Message } from "./ai.provider";
import { GroqProvider } from "./groq";
import { MistralProvider } from "./mistral";
import { OpenRouterProvider } from "./openrouter";
import { GeminiProvider } from "./gemini";

type ProviderEntry = {
  name: string;
  provider: AIProvider;
};

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const message =
    "message" in error
      ? String((error as { message?: unknown }).message)
      : "";

  const match = message.match(/\b(401|402|403|429|500|502|503|504)\b/);

  return match ? Number(match[1]) : null;
}

function isTemporaryFailure(error: unknown): boolean {
  const status = getErrorStatus(error);

  return (
    status === 402 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

export class AIRouter implements AIProvider {
  private providers: ProviderEntry[];

  constructor() {
    this.providers = [
      {
        name: "Groq",
        provider: new GroqProvider(),
      },
      {
        name: "Mistral",
        provider: new MistralProvider(),
      },
      {
        name: "OpenRouter",
        provider: new OpenRouterProvider(),
      },
      {
        name: "Gemini",
        provider: new GeminiProvider(),
      },
    ];
  }

  async chat(messages: Message[]): Promise<string> {
    let lastError: unknown = null;

    for (const entry of this.providers) {
      try {
        console.log(`Trying AI provider: ${entry.name}`);

        const reply = await entry.provider.chat(messages);

        console.log(`AI provider succeeded: ${entry.name}`);

        return reply;
      } catch (error) {
        lastError = error;

        const status = getErrorStatus(error);

        if (isTemporaryFailure(error)) {
          console.warn(
            `AI provider temporarily unavailable: ${entry.name}`,
            { status }
          );
        } else {
          console.error(
            `AI provider failed: ${entry.name}`,
            { status, error }
          );
        }
      }
    }

    throw new Error(
      `All AI providers failed: ${String(lastError)}`
    );
  }
}