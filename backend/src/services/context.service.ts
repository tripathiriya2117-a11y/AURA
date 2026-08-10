import { AuraAppPlanetProvider } from "../planets/aura-app.provider";
import { PlanetContext, PlanetSummary } from "../planets/planet.provider";
import { GroqProvider } from "../providers/groq";

const planetProvider = new AuraAppPlanetProvider();

export type SelectedContext = {
  memory: PlanetContext[];
  planet: PlanetContext | null;
};

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

  const memory: PlanetContext[] = [];

  if (selfPlanet) {
    const selfContext =
      await planetProvider.getPlanetContext(
        selfPlanet.id
      );

    memory.push(selfContext);

    console.log("Loaded memory planet: Self");
  }

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

  const selectedPlanetId =
    (
      await groqProvider.chat(
        selectionMessages
      )
    ).trim();

  console.log(
    "Selected planet:",
    selectedPlanetId
  );

  const selectedPlanet = planets.find(
    (planet) =>
      planet.id === selectedPlanetId
  );

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