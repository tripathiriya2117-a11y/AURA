export type Message = {
  role: "user" | "assistant";
  content: string;
};

export interface AIProvider {
  chat(messages: Message[]): Promise<string>;
}