const PINTEREST_API_URL = "https://api.pinterest.com/v5";

export async function getPinterestAccount() {
  const token = process.env.PINTEREST_API_KEY;

  if (!token) {
    throw new Error("PINTEREST_API_KEY is not configured");
  }

  const response = await fetch(
    `${PINTEREST_API_URL}/user_account`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Pinterest API error: ${response.status} ${errorText}`
    );
  }

  return response.json();
}