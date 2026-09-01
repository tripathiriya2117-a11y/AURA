import fs from "fs";
import path from "path";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const HISTORY_FILE = path.join(
  process.cwd(),
  "data",
  "conversation-history.json"
);

let history: Message[] = [];

function loadHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      history = [];
      return;
    }

    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      history = parsed;
    } else {
      history = [];
    }
  } catch (error) {
    console.error(
      "Failed to load conversation history:",
      error
    );

    history = [];
  }
}

function saveHistory() {
  try {
    fs.mkdirSync(
      path.dirname(HISTORY_FILE),
      { recursive: true }
    );

    fs.writeFileSync(
      HISTORY_FILE,
      JSON.stringify(history, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error(
      "Failed to save conversation history:",
      error
    );
  }
}

export function addUserMessage(content: string) {
  history.push({
    role: "user",
    content,
  });

  saveHistory();
}

export function addAssistantMessage(content: string) {
  history.push({
    role: "assistant",
    content,
  });

  saveHistory();
}

export function getHistory(): Message[] {
  return [...history];
}

loadHistory();