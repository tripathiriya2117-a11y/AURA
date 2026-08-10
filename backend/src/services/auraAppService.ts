const AURA_APP_API_URL = "https://aura-angles-api.onrender.com";

export async function getPlanets() {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/planets`
  );

  if (!response.ok) {
    throw new Error(
      `aura-app API error: ${response.status}`
    );
  }

  return response.json();
}

export async function getPlanet(planetId: string) {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/planets/${planetId}`
  );

  if (!response.ok) {
    throw new Error(
      `aura-app API error: ${response.status}`
    );
  }

  return response.json();
}

export async function getPlanetContext(planetId: string) {
  const planet = await getPlanet(planetId);

  const collections = await getCollections(planetId);

  const collectionsWithItems = await Promise.all(
    collections.map(async (collection: any) => {
      const items = await getItems(collection.id);

      return {
        ...collection,
        items,
      };
    })
  );

  return {
    planet,
    collections: collectionsWithItems,
  };
}

export async function getCollections(planetId: string) {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/collections/planet/${planetId}`
  );

  if (!response.ok) {
    throw new Error(
      `aura-app API error: ${response.status}`
    );
  }

  return response.json();
}

export async function getItems(collectionId: string) {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/collections/${collectionId}/items`
  );

  if (!response.ok) {
    throw new Error(
      `aura-app API error: ${response.status}`
    );
  }

  return response.json();
}