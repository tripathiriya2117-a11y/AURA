import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

type Message = {
  id?: string;
  timestamp?: string;
  role: "user" | "assistant";
  content: string;
};

const HISTORY_FILE = path.join(
  process.cwd(),
  "data",
  "conversation-history.json"
);
const BACKUP_FILE = `${HISTORY_FILE}.bak`;

let history: Message[] = [];

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function readJsonFileSync(filePath: string): Message[] | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function loadHistory() {
  const loaded = readJsonFileSync(HISTORY_FILE);

  if (loaded !== null) {
    history = loaded;
    return;
  }

  console.error(
    "Failed to load conversation history from primary file, trying backup..."
  );

  const backupLoaded = readJsonFileSync(BACKUP_FILE);

  if (backupLoaded !== null) {
    history = backupLoaded;
    console.log("Recovered conversation history from backup.");

    return;
  }

  console.error(
    "Failed to load conversation history from backup. Starting fresh."
  );

  history = [];
}

async function saveHistory() {
  try {
    await fsPromises.mkdir(path.dirname(HISTORY_FILE), { recursive: true });

    const json = JSON.stringify(history, null, 2);
    const tmpPath = `${HISTORY_FILE}.${Date.now()}.${Math.random().toString(36).slice(2, 9)}.tmp`;

    await fsPromises.writeFile(tmpPath, json, "utf-8");
    await fsPromises.copyFile(tmpPath, HISTORY_FILE);
    await fsPromises.rm(tmpPath).catch(() => {});
    await fsPromises.copyFile(HISTORY_FILE, BACKUP_FILE).catch(() => {});
  } catch (error) {
    console.error("Failed to save conversation history:", error);
  }
}

export function addUserMessage(content: string): Promise<void> {
  history.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    role: "user",
    content,
  });

  return saveHistory();
}

export function addAssistantMessage(content: string): Promise<void> {
  history.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    role: "assistant",
    content,
  });

  return saveHistory();
}

export function getHistory(): Message[] {
  return [...history];
}

loadHistory();
