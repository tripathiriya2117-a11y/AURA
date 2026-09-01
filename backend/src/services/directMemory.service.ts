import { PlanetContext } from "../planets/planet.provider";

type DirectMemoryResult =
  | {
      handled: true;
      reply: string;
    }
  | {
      handled: false;
    };

export function tryDirectMemoryAnswer(
  message: string,
  context: PlanetContext | null
): DirectMemoryResult {
  if (!context) {
    return { handled: false };
  }

  const normalized = message
    .toLowerCase()
    .trim();

  // Collections in a planet
  if (
    normalized.includes("what collections") &&
    (
      normalized.includes(context.name.toLowerCase()) ||
      normalized.includes("planet")
    )
  ) {
    if (context.collections.length === 0) {
      return {
        handled: true,
        reply: `Your ${context.name} planet currently has no collections.`,
      };
    }

    const names = context.collections.map(
      (collection) => collection.title
    );

    return {
      handled: true,
      reply:
        `Your ${context.name} planet currently contains ` +
        `${names.length} collection${names.length === 1 ? "" : "s"}: ` +
        names.join(", ") +
        ".",
    };
  }

  // Number of collections
  if (
    (
      normalized.includes("how many collections") ||
      normalized.includes("number of collections")
    ) &&
    normalized.includes(context.name.toLowerCase())
  ) {
    return {
      handled: true,
      reply:
        `Your ${context.name} planet has ` +
        `${context.collections.length} collection` +
        `${context.collections.length === 1 ? "" : "s"}.`,
    };
  }

  return {
    handled: false,
  };
}