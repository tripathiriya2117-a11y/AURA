const AURA_APP_API_URL =
  "https://aura-angles-api.onrender.com";

export type CreateItemInput = {
  collectionId: string;
  title: string;
  content: string;
  type?: "text" | "link";
};

export type CreateCollectionInput = {
  planetId: string;
  title: string;
};

export async function createCollection(
  input: CreateCollectionInput
) {
  const now = new Date().toISOString();

  const collection = {
    id: Date.now().toString(),
    planetId: input.planetId,
    title: input.title.trim(),
    count: 0,
    createdAt: now,
    updatedAt: now,
  };

  const response = await fetch(
    `${AURA_APP_API_URL}/api/collections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collection),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to create collection: ${response.status} ${error}`
    );
  }

  return response.json();
}

export async function createItem(
  input: CreateItemInput
) {
  const now = new Date().toISOString();

  const item = {
    id: Date.now().toString(),
    collectionId: input.collectionId,
    type: input.type ?? "text",
    title: input.title.trim(),
    content: input.content.trim(),
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
      `Failed to create item: ${response.status} ${error}`
    );
  }

  return response.json();
}

export type UpdateItemInput = {
  id: string;
  title?: string;
  content?: string;
  type?: "text" | "link";
};

export async function updateItem(
  input: UpdateItemInput
) {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/items/${input.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        updatedAt: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to update item: ${response.status} ${error}`
    );
  }

  return response.json();
}

// ─── Task actions ──────────────────────────────────────────────

export type CreateTaskInput = {
  title: string;
  description?: string;
  type?: "task" | "deadline" | "reminder";
  status?: "not_started" | "in_progress" | "completed" | "archived";
  priority?: "low" | "medium" | "high";
  dueAt?: string;
  reminderAt?: string;
  source?: "victor" | "manual";
};

export async function createTask(
  input: CreateTaskInput
) {
  const now = new Date().toISOString();

  const task = {
    id: Date.now().toString(),
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    type: input.type ?? "task",
    status: input.status ?? "not_started",
    priority: input.priority ?? "medium",
    dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : undefined,
    reminderAt: input.reminderAt
      ? new Date(input.reminderAt).toISOString()
      : undefined,
    source: input.source ?? "victor",
    createdAt: now,
    updatedAt: now,
  };

  const response = await fetch(
    `${AURA_APP_API_URL}/api/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to create task: ${response.status} ${error}`
    );
  }

  return response.json();
}

export type UpdateTaskInput = {
  id: string;
  title?: string;
  description?: string;
  type?: "task" | "deadline" | "reminder";
  status?: "not_started" | "in_progress" | "completed" | "archived";
  priority?: "low" | "medium" | "high";
  dueAt?: string;
  reminderAt?: string;
};

export async function updateTask(
  input: UpdateTaskInput
) {
  const body: Record<string, unknown> = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (input.dueAt !== undefined) {
    body.dueAt = input.dueAt ? new Date(input.dueAt).toISOString() : undefined;
  }

  if (input.reminderAt !== undefined) {
    body.reminderAt = input.reminderAt
      ? new Date(input.reminderAt).toISOString()
      : undefined;
  }

  const response = await fetch(
    `${AURA_APP_API_URL}/api/tasks/${input.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to update task: ${response.status} ${error}`
    );
  }

  return response.json();
}

export async function completeTask(id: string) {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/tasks/${id}/complete`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to complete task: ${response.status} ${error}`
    );
  }

  return response.json();
}

export async function listTasks() {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/tasks`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to list tasks: ${response.status}`
    );
  }

  return response.json();
}

export async function getUpcomingTasks() {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/tasks/upcoming`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch upcoming tasks: ${response.status}`
    );
  }

  return response.json();
}

export async function getTodayTasks() {
  const response = await fetch(
    `${AURA_APP_API_URL}/api/tasks/today`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch today's tasks: ${response.status}`
    );
  }

  return response.json();
}
