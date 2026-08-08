import { getRelevantMemory } from "./memory.service";
import {
  addUserMessage,
  addAssistantMessage,
  getHistory,
} from "./history.service";
import { GroqProvider } from "../providers/groq";

const provider = new GroqProvider();

export async function processMessage(message: string) {
  const memory = await getRelevantMemory(message);

  console.log("Memory:", memory);

  addUserMessage(message);

  const history = getHistory();

  const reply = await provider.chat(history);

  addAssistantMessage(reply);

  return reply;
}