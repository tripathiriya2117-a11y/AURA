import {
  PlanetProvider,
  PlanetContext,
  PlanetCollection,
  PlanetItem,
  PlanetSummary,
} from "./planet.provider";

export class AuraAppPlanetProvider implements PlanetProvider {
  private baseUrl = "https://aura-angles-api.onrender.com";

  async getPlanets(): Promise<PlanetSummary[]> {
  const planetsUrl = `${this.baseUrl}/api/planets`;

  console.log("Fetching planets:", planetsUrl);

  const response = await fetch(planetsUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch planets: ${response.status}`
    );
  }

  const planets = await response.json();

  return planets.map((planet: any) => ({
    id: planet.id,
    name: planet.name ?? planet.title,
  }));
}

  async getPlanetContext(planetId: string): Promise<PlanetContext> {
    const planetUrl = `${this.baseUrl}/api/planets/${planetId}`;

    console.log("Fetching planet:", planetUrl);

    const planetResponse = await fetch(planetUrl);

    if (!planetResponse.ok) {
      throw new Error(
        `Failed to fetch planet: ${planetResponse.status}`
      );
    }

    const planet = await planetResponse.json();

    const collectionsUrl =
      `${this.baseUrl}/api/planets/${planetId}/collections`;

    console.log("Fetching collections:", collectionsUrl);

    const collectionsResponse = await fetch(collectionsUrl);

    if (!collectionsResponse.ok) {
      throw new Error(
        `Failed to fetch collections: ${collectionsResponse.status}`
      );
    }

    const collections = await collectionsResponse.json();

    const planetCollections: PlanetCollection[] = [];

    for (const collection of collections) {
      const itemsUrl =
        `${this.baseUrl}/api/collections/${collection.id}/items`;

      console.log("Fetching items:", itemsUrl);

      const itemsResponse = await fetch(itemsUrl);

      if (!itemsResponse.ok) {
        throw new Error(
          `Failed to fetch items: ${itemsResponse.status}`
        );
      }

      const items = await itemsResponse.json();

      const planetItems: PlanetItem[] = items.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        content: item.content,
      }));

      planetCollections.push({
        id: collection.id,
        title: collection.title,
        items: planetItems,
      });
    }

    return {
      id: planet.id,
      name: planet.name ?? planet.title,
      collections: planetCollections,
    };
  }
}