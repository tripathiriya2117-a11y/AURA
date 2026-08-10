import { AuraAppPlanetProvider } from "../planets/aura-app.provider";

const planetProvider = new AuraAppPlanetProvider();

export async function getPlanetContext(planetId: string) {
  return await planetProvider.getPlanetContext(planetId);
}