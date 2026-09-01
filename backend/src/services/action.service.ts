import {
  createItem,
  createCollection,
  CreateItemInput,
  CreateCollectionInput,
  UpdateItemInput,
  updateItem,
  createTask,
  CreateTaskInput,
  updateTask,
  UpdateTaskInput,
  completeTask,
  listTasks,
  getUpcomingTasks,
  getTodayTasks,
} from "./auraAppAction.service";

export type Action =
  | {
      type: "none";
    }
  | {
      type: "clarification";
      question: string;
    }
  | {
      type: "create_collection";
      input: CreateCollectionInput;
    }
  | {
      type: "create_item";
      input: CreateItemInput;
    }
  | {
      type: "update_item";
      input: UpdateItemInput;
    }
  | {
      type: "create_task";
      input: CreateTaskInput;
    }
  | {
      type: "update_task";
      input: UpdateTaskInput;
    }
  | {
      type: "complete_task";
      input: { id: string };
    }
  | {
      type: "list_tasks";
    }
  | {
      type: "get_upcoming_tasks";
    }
  | {
      type: "get_today_tasks";
    };

export async function executeAction(action: Action) {
  switch (action.type) {
    case "none":
      return null;

    case "clarification":
      return null;

    case "create_collection":
      return await createCollection(action.input);

    case "create_item":
      return await createItem(action.input);

    case "update_item":
      return await updateItem(action.input);

    case "create_task":
      return await createTask(action.input);

    case "update_task":
      return await updateTask(action.input);

    case "complete_task":
      return await completeTask(action.input.id);

    case "list_tasks":
      return await listTasks();

    case "get_upcoming_tasks":
      return await getUpcomingTasks();

    case "get_today_tasks":
      return await getTodayTasks();

    default:
      throw new Error("Unsupported action");
  }
}