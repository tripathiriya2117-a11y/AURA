function stripMarkdown(text: string): string {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove markdown headings
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold / italic markers
    .replace(/(\*\*|__|\*|_)/g, "")
    // Remove inline code markers
    .replace(/`([^`]*)`/g, "$1")
    // Remove markdown links but keep their text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove bullet markers
    .replace(/^\s*[-*+]\s+/gm, "")
    // Remove numbered-list markers
    .replace(/^\s*\d+\.\s+/gm, "")
    // Clean excessive whitespace
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createSpeechText(reply: string): string {
  const clean = stripMarkdown(reply);

  if (!clean) {
    return "";
  }

  // Keep voice responses reasonably short.
  const sentences =
    clean.match(/[^.!?]+[.!?]+/g) ?? [clean];

  const shortSpeech = sentences
    .slice(0, 3)
    .join(" ")
    .trim();

  return shortSpeech || clean;
}