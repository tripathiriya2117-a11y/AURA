import { getRelevantMemory } from "./memory.service";
import { GroqProvider } from "../providers/groq";

import {
  addUserMessage,
  addAssistantMessage,
  getHistory,
} from "./history.service";

import { AuraAppPlanetProvider } from "../planets/aura-app.provider";

const planetProvider = new AuraAppPlanetProvider();

export async function processMessage(message: string) {
  const memory = await getRelevantMemory(message);

  console.log("Memory:", memory);

  addUserMessage(message);

  const history = getHistory();

  const selfPlanet = await planetProvider.getPlanetContext(
    "design-studio"
  );

  const planetContext = {
    self: selfPlanet,
  };

  const messages = [
    {
      role: "system" as const,
      content: `
You are Victor, a personal AI assistant.

You have access to the user's personal Planet data below.
Use it when it is relevant to the user's request.

Do not claim to know information that is not present in the provided context.

PERSONAL PLANET CONTEXT:
${JSON.stringify(planetContext, null, 2)}
      `.trim(),
    },
    ...history,
  ];

  const groqProvider = new GroqProvider();

const reply = await groqProvider.chat(messages);

  addAssistantMessage(reply);

  return reply;
}