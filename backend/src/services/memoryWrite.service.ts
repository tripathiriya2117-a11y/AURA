const AURA_APP_API_URL =
  "https://aura-angles-api.onrender.com";

const MEMORY_COLLECTION_ID =
  "1786361585998";

export async function saveMemory(
  title: string,
  content: string
) {
  const now = new Date().toISOString();

  const item = {
    id: Date.now().toString(),
    collectionId: MEMORY_COLLECTION_ID,
    type: "text",
    title: title.trim(),
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const response = await fetch(
    `${AURA_APP_API_URL}/api/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to save memory: ${response.status} ${error}`
    );
  }

  return response.json();
}