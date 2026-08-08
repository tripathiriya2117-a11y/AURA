type Message = {
  role: "user" | "assistant";
  content: string;
};

const history: Message[] = [];

export function addUserMessage(content: string) {
  history.push({
    role: "user",
    content,
  });
}

export function addAssistantMessage(content: string) {
  history.push({
    role: "assistant",
    content,
  });
}

export function getHistory() {
  return history;
}