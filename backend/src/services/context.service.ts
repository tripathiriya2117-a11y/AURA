import { AuraAppPlanetProvider } from "../planets/aura-app.provider";
import {
  PlanetContext,
  PlanetSummary,
} from "../planets/planet.provider";
import { GroqProvider } from "../providers/groq";

const planetProvider = new AuraAppPlanetProvider();

export type SelectedContext = {
  memory: PlanetContext[];
  planet: PlanetContext | null;
};

function findDirectPlanetMatch(
  message: string,
  planets: PlanetSummary[]
): PlanetSummary | null {
  const normalizedMessage = message.toLowerCase();

  // Prefer exact planet-name matches.
  const exactMatch = planets.find((planet) =>
    normalizedMessage.includes(planet.name.toLowerCase())
  );

  if (exactMatch) {
    return exactMatch;
  }

  return null;
}

async function selectPlanetWithAI(
  message: string,
  planets: PlanetSummary[]
): Promise<PlanetSummary | null> {
  const selectionMessages = [
    {
      role: "system" as const,
      content: `
You are selecting the most relevant personal planet
for a user's request.

Available planets:
${JSON.stringify(planets, null, 2)}

Rules:
- Return ONLY the exact planet ID from the list.
- Do not return the planet name.
- Do not explain your answer.
- If none is relevant, return NONE.
      `.trim(),
    },
    {
      role: "user" as const,
      content: message,
    },
  ];

  const groqProvider = new GroqProvider();

  const selectedPlanetId = (
    await groqProvider.chat(selectionMessages)
  ).trim();

  console.log(
    "AI selected planet:",
    selectedPlanetId
  );

  return (
    planets.find(
      (planet) => planet.id === selectedPlanetId
    ) ?? null
  );
}

export async function selectContext(
  message: string
): Promise<SelectedContext> {
  const planets: PlanetSummary[] =
    await planetProvider.getPlanets();

  console.log("Available planets:", planets);

  const selfPlanet = planets.find(
    (planet) =>
      planet.name.toLowerCase() === "self"
  );

  /*
   * First try deterministic matching.
   * This avoids an AI call when the user explicitly
   * mentions an existing planet.
   */
  let selectedPlanet =
    findDirectPlanetMatch(message, planets);

  if (selectedPlanet) {
    console.log(
      "Direct planet match:",
      selectedPlanet.name
    );
  } else {
    /*
     * No obvious match.
     * Only now use Groq as a fallback.
     */
    console.log(
      "No direct planet match. Using AI selector."
    );

    selectedPlanet =
      await selectPlanetWithAI(
        message,
        planets
      );
  }

  /*
   * Self is persistent personal memory.
   *
   * We currently keep this behavior so the existing
   * memory system continues working while we refactor
   * context selection incrementally.
   */
  const memory: PlanetContext[] = [];

  if (selfPlanet) {
    const selfContext =
      await planetProvider.getPlanetContext(
        selfPlanet.id
      );

    memory.push(selfContext);

    console.log(
      "Loaded memory planet: Self"
    );
  }

  let planet: PlanetContext | null = null;

  if (selectedPlanet) {
    planet =
      await planetProvider.getPlanetContext(
        selectedPlanet.id
      );

    console.log(
      "Loaded planet context:",
      selectedPlanet.name
    );
  }

  return {
    memory,
    planet,
  };
}