import { GroqProvider } from "../providers/groq";
import { selectContext } from "./context.service";

import {
  addUserMessage,
  addAssistantMessage,
  getHistory,
} from "./history.service";

export async function processMessage(
  message: string
) {
  addUserMessage(message);

  const history = getHistory();

  // Select all context needed for this request
  const context = await selectContext(message);

  console.log("Selected context:", {
    memory: context.memory.map(
      (planet) => planet.name
    ),
    planet: context.planet?.name ?? null,
  });

  const messages = [
    {
      role: "system" as const,
      content: `
You are Victor, a personal AI assistant.

Use the user's personal memory and relevant planet
context when they are useful for answering the request.

Do not claim to know information that is not present
in the provided context.

If the context does not contain the answer, say so honestly.

PERSONAL MEMORY:
${JSON.stringify(context.memory, null, 2)}

RELEVANT PLANET CONTEXT:
${JSON.stringify(context.planet, null, 2)}
      `.trim(),
    },
    ...history,
  ];

  const groqProvider = new GroqProvider();

  const reply = await groqProvider.chat(messages);

  addAssistantMessage(reply);

  return reply;
}