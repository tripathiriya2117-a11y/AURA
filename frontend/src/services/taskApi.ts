import type { Task, CreateTaskInput } from "../types/task";

const API_URL = "https://aura-angles-api.onrender.com";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.message || data.error || `Request failed: ${response.status}`
    );
  }

  return response.json();
}

export function getTasks(): Promise<Task[]> {
  return request<Task[]>("/api/tasks");
}

export function getTodayTasks(): Promise<Task[]> {
  return request<Task[]>("/api/tasks/today");
}

export function getUpcomingTasks(): Promise<Task[]> {
  return request<Task[]>("/api/tasks/upcoming");
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return request<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ ...input, source: "manual" }),
  });
}

export function completeTask(id: string): Promise<Task> {
  return request<Task>(`/api/tasks/${id}/complete`, {
    method: "PUT",
  });
}

export function updateTask(
  id: string,
  input: Partial<CreateTaskInput>
): Promise<Task> {
  return request<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/api/tasks/${id}`, {
    method: "DELETE",
  });
}
