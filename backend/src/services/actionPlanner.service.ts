import { GroqProvider } from "../providers/groq";
import { Action } from "./action.service";
import { PlanetContext } from "../planets/planet.provider";

const groqProvider = new GroqProvider();

export async function planAction(
  message: string,
  planet: PlanetContext | null
): Promise<Action> {
  if (!planet) {
    return { type: "none" };
  }

  const currentDate = new Date().toISOString();

  const messages = [
    {
      role: "system" as const,
      content: `
You are Victor's action planner.

Your job is to determine whether the user wants
to modify or query their personal aura-app data.

CURRENT DATE/TIME: ${currentDate}

CURRENT PLANET:
${JSON.stringify(planet, null, 2)}

SUPPORTED ACTIONS:

1. create_item
2. create_collection
3. create_task
4. update_item
5. update_task
6. complete_task
7. list_tasks
8. get_upcoming_tasks
9. get_today_tasks
10. clarification
11. none

RULES:

- Only perform an action when the user explicitly asks
  to change or query their aura-app data.

- Before choosing any action, determine whether the user
  is asking for INFORMATION/QUERY or asking to CHANGE data.

- Never invent IDs.

- For create_item, collectionId MUST be an ID from
  the collections in CURRENT PLANET.

- If the user wants to add something but there is no
  suitable existing collection, do NOT put the item
  into an unrelated collection.

- In that situation, ask whether a new collection
  should be created.

- Do not invent missing scheduling details.

- Do not create a collection automatically just because
  you think one would be useful.

- When the user gives a relative date such as
  "Friday", "tomorrow", "next Monday", "in 3 days",
  resolve it against CURRENT DATE/TIME above and emit
  the exact ISO-8601 date-time string.

- If the date is genuinely ambiguous or missing,
  return clarification asking the user for the date
  instead of inventing one.

- If the user is not asking to modify or query aura-app data,
  return:
  {"type":"none"}


READ / QUERY REQUESTS:

Questions such as:

- "Is there a study session for NIMCET?"
- "Do I have a NIMCET study session?"
- "When is my NIMCET study session?"
- "What is in my Schedule?"
- "What collections do I have?"
- "What time is my college?"
- "Tell me about my NIMCET schedule."
- "What tasks do I have today?"
- "What's due this week?"
- "What am I supposed to do today?"
- "Show my upcoming tasks."
- "List all my tasks."

are READ requests.

For task-related read requests, ALWAYS return the
corresponding task read action:

- "What tasks do I have today?" / "What am I supposed to do today?"
  → {"type":"get_today_tasks"}

- "What's due this week?" / "What's coming up?"
  → {"type":"get_upcoming_tasks"}

- "Show my tasks." / "List all tasks."
  → {"type":"list_tasks"}

For collection/item read requests, ALWAYS return:

{
  "type": "none"
}

Do NOT return clarification for a READ request.
Do NOT ask whether the user wants to create something.


WRITE REQUESTS:

Only use create_item, create_collection, create_task,
update_item, update_task, complete_task, or clarification
when the user explicitly wants to change personal data.

Examples:

"Add a NIMCET study session."
→ write request

"Create a NIMCET collection."
→ write request

"Change my Monday session to Tuesday."
→ write request

"Delete my NIMCET session."
→ write request

"I have an internship assignment due Friday."
→ write request → create_task

"Remind me to submit this tomorrow."
→ write request → create_task

"Mark my internship as complete."
→ write request → complete_task

"Is there a NIMCET session?"
→ READ request → none or task read action

"Do I have a NIMCET session?"
→ READ request → none or task read action

"When is my NIMCET session?"
→ READ request → none or task read action


OUTPUT FORMAT:

No action:
{
  "type": "none"
}

Clarification:
{
  "type": "clarification",
  "question": "..."
}

Create collection:
{
  "type": "create_collection",
  "input": {
    "planetId": "EXISTING_PLANET_ID",
    "title": "..."
  }
}

Create item:
{
  "type": "create_item",
  "input": {
    "collectionId": "EXISTING_COLLECTION_ID",
    "title": "...",
    "content": "...",
    "type": "text"
  }
}

Create task:
{
  "type": "create_task",
  "input": {
    "title": "...",
    "description": "...",
    "type": "task",
    "status": "not_started",
    "priority": "medium",
    "dueAt": "2026-01-15T23:59:00.000Z",
    "source": "victor"
  }
}

Update task:
{
  "type": "update_task",
  "input": {
    "id": "EXISTING_TASK_ID",
    "title": "...",
    "status": "in_progress"
  }
}

Complete task:
{
  "type": "complete_task",
  "input": {
    "id": "EXISTING_TASK_ID"
  }
}

List tasks:
{
  "type": "list_tasks"
}

Get upcoming tasks:
{
  "type": "get_upcoming_tasks"
}

Get today tasks:
{
  "type": "get_today_tasks"
}

Return ONLY valid JSON.
Do not explain your reasoning.
Do not execute anything.
      `.trim(),
    },
    {
      role: "user" as const,
      content: message,
    },
  ];

  const result = await groqProvider.chat(messages);

  try {
    const parsed = JSON.parse(result);

    const allowedTypes = new Set([
      "none",
      "clarification",
      "create_item",
      "create_collection",
      "update_item",
      "create_task",
      "update_task",
      "complete_task",
      "list_tasks",
      "get_upcoming_tasks",
      "get_today_tasks",
    ]);

    if (!allowedTypes.has(parsed.type)) {
      return { type: "none" };
    }

    return parsed as Action;
  } catch {
    console.error(
      "Failed to parse action planner response:",
      result
    );

    return { type: "none" };
  }
}