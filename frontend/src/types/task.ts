export type TaskType = "task" | "deadline" | "reminder";
export type TaskStatus = "not_started" | "in_progress" | "completed" | "archived";
export type TaskPriority = "low" | "medium" | "high";
export type TaskSource = "victor" | "manual";

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  reminderAt?: string;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  dueAt?: string;
  reminderAt?: string;
}
