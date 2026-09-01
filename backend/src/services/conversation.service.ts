import { AIRouter } from "../providers/ai.router";
import { selectContext } from "./context.service";
import { planAction } from "./actionPlanner.service";
import { executeAction } from "./action.service";
import { createSpeechText } from "./speech.service";
import { tryDirectMemoryAnswer } from "./directMemory.service";

import {
  getUpcomingTasks,
  getTodayTasks,
  listTasks,
} from "./auraAppAction.service";

import {
  addUserMessage,
  addAssistantMessage,
  getHistory,
} from "./history.service";

export async function processMessage(message: string) {
  addUserMessage(message);

  const history = getHistory();

  // 1. Select relevant context
  const context = await selectContext(message);

  console.log("Selected context:", {
    memory: context.memory.map((planet) => planet.name),
    planet: context.planet?.name ?? null,
  });

  // 2. Ask the action planner whether this request
  // requires modifying aura-app data.
  const action = await planAction(
    message,
    context.planet
  );

  console.log("Planned action:", action);

  // 3. Handle requests that need clarification.
  if (action.type === "clarification") {
    addAssistantMessage(action.question);

    return {
      reply: action.question,
      speech: createSpeechText(action.question),
    };
  }

  // 4. Create collection
  if (action.type === "create_collection") {
    try {
      const createdCollection =
        await executeAction(action);

      const reply =
        `Done. I created the "${createdCollection.title}" ` +
        `collection in your ${context.planet?.name ?? ""} planet.`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Collection creation failed:",
        error
      );

      const reply =
        "I couldn't create that collection in your aura-app data.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

  // 5. Create item
  if (action.type === "create_item") {
    try {
      const createdItem =
        await executeAction(action);

      const reply =
        `Done. I added "${createdItem.title}" ` +
        `to your ${context.planet?.name ?? ""} planet.`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Action execution failed:",
        error
      );

      const reply =
        "I couldn't make that change to your aura-app data.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

  // 6. Update item
  if (action.type === "update_item") {
    try {
      const updatedItem =
        await executeAction(action);

      const reply =
        `Done. I updated "${updatedItem.title}".`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Item update failed:",
        error
      );

      const reply =
        "I couldn't update that item in your aura-app data.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

  // 7. Create task
  if (action.type === "create_task") {
    try {
      const createdTask =
        await executeAction(action);

      const dueText = createdTask.dueAt
        ? ` due ${new Date(createdTask.dueAt).toLocaleString()}`
        : "";

      const reply =
        `Done. I created the task "${createdTask.title}"` +
        `${dueText}.`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Task creation failed:",
        error
      );

      const reply =
        "I couldn't create that task. Please try again.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

  // 8. Update task
  if (action.type === "update_task") {
    try {
      const updatedTask =
        await executeAction(action);

      const reply =
        `Done. I updated "${updatedTask.title}".`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Task update failed:",
        error
      );

      const reply =
        "I couldn't update that task. Please try again.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

  // 9. Complete task
  if (action.type === "complete_task") {
    try {
      const updatedTask =
        await executeAction(action);

      const reply =
        `Done. "${updatedTask.title}" is marked complete.`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Task completion failed:",
        error
      );

      const reply =
        "I couldn't complete that task. Please try again.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

  // 10. List tasks (read)
  if (
    action.type === "list_tasks" ||
    action.type === "get_upcoming_tasks" ||
    action.type === "get_today_tasks"
  ) {
    try {
      const tasks = await executeAction(action);

      if (!Array.isArray(tasks) || tasks.length === 0) {
        const reply =
          action.type === "get_today_tasks"
            ? "You have no tasks due today."
            : action.type === "get_upcoming_tasks"
              ? "You have no upcoming tasks."
              : "You have no tasks.";

        addAssistantMessage(reply);

        return {
          reply,
          speech: createSpeechText(reply),
        };
      }

      const lines = tasks.map((task: any) => {
        const status = task.status?.replace("_", " ") ?? "no status";
        const due = task.dueAt
          ? ` — due ${new Date(task.dueAt).toLocaleString()}`
          : "";
        const priority = task.priority
          ? ` [${task.priority}]`
          : "";

        return `- ${task.title}${priority} (${status})${due}`;
      });

      const prefix =
        action.type === "get_today_tasks"
          ? "Here's what you have due today:"
          : action.type === "get_upcoming_tasks"
            ? "Here's what's coming up:"
            : "Here are all your tasks:";

      const reply = `${prefix}\n${lines.join("\n")}`;

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    } catch (error) {
      console.error(
        "Task query failed:",
        error
      );

      const reply =
        "I couldn't load your tasks right now. Please try again.";

      addAssistantMessage(reply);

      return {
        reply,
        speech: createSpeechText(reply),
      };
    }
  }

    // 11. Try answering simple factual memory questions
    // directly from aura-app without calling an AI provider.
    const directMemoryAnswer =
      tryDirectMemoryAnswer(
        message,
        context.planet
      );

  if (directMemoryAnswer.handled) {
    addAssistantMessage(
      directMemoryAnswer.reply
    );

    return {
      reply: directMemoryAnswer.reply,
      speech: createSpeechText(
        directMemoryAnswer.reply
      ),
    };
  }

  const directTaskAnswer = await tryDirectTaskAnswer(message);

  if (directTaskAnswer.handled) {
    addAssistantMessage(
      directTaskAnswer.reply
    );

    return {
      reply: directTaskAnswer.reply,
      speech: createSpeechText(
        directTaskAnswer.reply
      ),
    };
  }

  // 8. No action required → normal Victor response.
  const messages = [
    {
      role: "system" as const,
      
content: `
You are Victor, a personal AI assistant.

You are having a real conversation with the user, not writing
reports about them.

CONVERSATIONAL STYLE:

- Speak naturally, casually, and directly.
- Default to short responses: usually 1–5 sentences.
- Do not turn ordinary conversation into an essay.
- Do not use headings, numbered lists, or sections unless
  the user explicitly asks for detailed analysis or the
  structure genuinely helps.
- Do not repeat information unnecessarily.
- Match the seriousness and energy of the conversation.
- You can be playful, sarcastic, or lightly teasing when
  appropriate.
- You are allowed to challenge the user when something
  doesn't add up.

  CONVERSATION FIRST:

Not every user message is a request for analysis or advice.

If the user is simply telling you something, respond to
what they said naturally instead of automatically giving
advice.

If the user is thinking out loud, engage with the thought.

If the user is joking, joke back.

If the user is venting, don't immediately turn it into
a structured analysis.

Only give detailed advice when the user asks for it or
when a useful intervention is clearly needed.

Do not explain your response with sections such as
"Why this works", "Key point", "What to do", or
"Here's why" during ordinary conversation.

Do not repeatedly restate the user's situation.

Prefer natural conversational responses such as:
"Yeah, then you're fine."
"Wait, that's actually different."
"Okay, but you're overthinking this part."
"Then just see what he says."
"Honestly? I wouldn't read too much into that."
"Bro 😭"
when appropriate to the conversation.

PERSONAL CONTEXT:

Use the provided personal memory, planet context, and recent
conversation history when relevant.

Do NOT dump the context back at the user simply because you
have access to it.

Use context to understand the conversation.

For example, if the user says:
"I don't care about C."

and previous conversation shows that they spent a long time
discussing C, you may naturally point out the contradiction:

"Oh really? Then why did you spend 20 minutes analyzing his
stare? 😂"

Do not automatically conclude what the contradiction means.
Point it out and let the conversation continue.

HONESTY:

- Never invent facts.
- Never claim to remember something that isn't in the
  provided context or conversation history.
- Never assume another person's feelings, intentions,
  attraction, or motivations without evidence.
- Clearly distinguish facts from guesses when the distinction
  matters.
- If you don't know something, say so.
- If the user's reasoning appears flawed, say so directly.
- Do not agree with the user merely to make them feel good.

IMPORTANT:

Do not use generic emotional filler such as:
"Your feelings are valid."
"That's completely understandable."
"I'm proud of you."
unless it is genuinely relevant and natural.

Do not automatically reassure the user.

Do not turn every personal question into psychological
analysis.

When the user makes a casual statement, respond conversationally.

When the user asks for an opinion, give an opinion while
making clear what is evidence and what is inference.

When the user explicitly asks for deep analysis, detailed
breakdown, or a serious assessment, you may give a longer
structured response.

MEMORY RULES:

- Personal memory is information retrieved from aura-app.
- Conversation history is previous interaction context.
- Do not confuse the two.
- Do not claim that a conversation happened merely because
  a similar fact exists in personal memory.
- If something was discussed in conversation history, you may
  refer to it naturally.
- If something exists only in personal memory, do not pretend
  you remember the original conversation that produced it.

RESPONSE LENGTH:

Default: conversational and concise.

Only become long when:
1. the user asks for detail,
2. the problem genuinely requires substantial explanation,
3. or the user asks for an analysis.

PERSONAL MEMORY:
${JSON.stringify(context.memory, null, 2)}

RELEVANT PLANET CONTEXT:
${JSON.stringify(context.planet, null, 2)}
`.trim(),
    },
    ...history,
  ];

  const aiRouter = new AIRouter();

  const reply = await aiRouter.chat(messages);

  addAssistantMessage(reply);

  return {
    reply,
    speech: createSpeechText(reply),
  };
}

type DirectTaskResult =
  | {
      handled: true;
      reply: string;
    }
  | {
      handled: false;
    };

async function tryDirectTaskAnswer(
  message: string
): Promise<DirectTaskResult> {
  const normalized = message
    .toLowerCase()
    .trim();

  try {
    if (
      normalized.includes("today") &&
      (normalized.includes("task") ||
        normalized.includes("due") ||
        normalized.includes("do") ||
        normalized.includes("have"))
    ) {
      const tasks = await getTodayTasks();

      if (!Array.isArray(tasks) || tasks.length === 0) {
        return {
          handled: true,
          reply: "You have no tasks due today.",
        };
      }

      const lines = tasks.map((task: any) => {
        const due = task.dueAt
          ? ` — due ${new Date(task.dueAt).toLocaleString()}`
          : "";
        const priority = task.priority
          ? ` [${task.priority}]`
          : "";

        return `- ${task.title}${priority}${due}`;
      });

      return {
        handled: true,
        reply:
          "Here's what you have due today:\n" +
          lines.join("\n"),
      };
    }

    if (
      normalized.includes("upcoming") ||
      normalized.includes("this week") ||
      normalized.includes("due soon") ||
      (normalized.includes("what") &&
        (normalized.includes("due") || normalized.includes("task")))
    ) {
      const tasks = await getUpcomingTasks();

      if (!Array.isArray(tasks) || tasks.length === 0) {
        return {
          handled: true,
          reply: "You have no upcoming tasks.",
        };
      }

      const lines = tasks.map((task: any) => {
        const due = task.dueAt
          ? ` — due ${new Date(task.dueAt).toLocaleString()}`
          : "";
        const priority = task.priority
          ? ` [${task.priority}]`
          : "";

        return `- ${task.title}${priority}${due}`;
      });

      return {
        handled: true,
        reply:
          "Here's what's coming up:\n" +
          lines.join("\n"),
      };
    }

    if (
      normalized.includes("list") &&
      normalized.includes("task")
    ) {
      const tasks = await listTasks();

      if (!Array.isArray(tasks) || tasks.length === 0) {
        return {
          handled: true,
          reply: "You have no tasks.",
        };
      }

      const lines = tasks.map((task: any) => {
        const due = task.dueAt
          ? ` — due ${new Date(task.dueAt).toLocaleString()}`
          : "";
        const priority = task.priority
          ? ` [${task.priority}]`
          : "";

        return `- ${task.title}${priority}${due}`;
      });

      return {
        handled: true,
        reply:
          "Here are all your tasks:\n" +
          lines.join("\n"),
      };
    }

    return { handled: false };
  } catch (error) {
    console.error("Direct task answer failed:", error);

    return { handled: false };
  }
}