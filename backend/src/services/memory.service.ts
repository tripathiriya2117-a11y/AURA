import {
  getPlanets,
  getPlanetContext,
} from "./auraAppService";

export async function getRelevantMemory(
  message: string
) {
  try {
    const planets = await getPlanets();

    // For now, use the Self planet as personal context.
    // We'll make this selection smarter later.
    const selfPlanet = planets.find(
      (planet: any) =>
        planet.name.toLowerCase() === "self"
    );

    if (!selfPlanet) {
      return [];
    }

    const context = await getPlanetContext(
      selfPlanet.id
    );

    return [context];
  } catch (error) {
    console.error(
      "Failed to retrieve aura-app memory:",
      error
    );

    return [];
  }
}