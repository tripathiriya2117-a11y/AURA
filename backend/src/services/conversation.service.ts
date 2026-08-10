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

  const groqProvider = new GroqProvider();

  // 1. Get available planets
  const planets = await planetProvider.getPlanets();

  console.log("Available planets:", planets);

  // 2. Ask Groq which planet is relevant
  const selectionMessages = [
    {
      role: "system" as const,
      content: `
You are selecting the most relevant personal planet for a user's request.

Available planets:
${JSON.stringify(planets, null, 2)}

Rules:
- Return ONLY the exact planet ID from the list.
- Do not return the planet name.
- Do not explain your answer.
- If none of the planets is relevant, return NONE.
      `.trim(),
    },
    {
      role: "user" as const,
      content: message,
    },
  ];

  const selectedPlanetId =
    (await groqProvider.chat(selectionMessages)).trim();

  console.log(
    "Selected planet:",
    selectedPlanetId
  );

  // 3. Validate the AI's selection
  const selectedPlanet = planets.find(
    (planet) => planet.id === selectedPlanetId
  );

  let planetContext = null;

  if (selectedPlanet) {
    planetContext =
      await planetProvider.getPlanetContext(
        selectedPlanet.id
      );

    console.log(
      "Loaded planet context:",
      selectedPlanet.name
    );
  }

  // 4. Give the actual context to the final AI response
  const messages = [
    {
      role: "system" as const,
      content: `
You are Victor, a personal AI assistant.

Use the user's personal planet context when it is relevant.

Do not claim to know information that is not present
in the provided context.

If the context does not contain the answer, say so honestly.

PERSONAL PLANET CONTEXT:
${JSON.stringify(planetContext, null, 2)}
      `.trim(),
    },
    ...history,
  ];

  const reply = await groqProvider.chat(messages);

  addAssistantMessage(reply);

  return reply;
}