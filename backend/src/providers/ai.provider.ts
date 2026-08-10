export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface AIProvider {
  chat(messages: Message[]): Promise<string>;
}