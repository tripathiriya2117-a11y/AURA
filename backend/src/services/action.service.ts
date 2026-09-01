import {
  createItem,
  createCollection,
  CreateItemInput,
  CreateCollectionInput,
  UpdateItemInput,
  updateItem,
  deleteItem,
  getItemById,
  listCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  createPlanet,
  CreatePlanetInput,
  UpdatePlanetInput,
  updatePlanet,
  deletePlanet,
  listPlanets,
  getPlanetById,
  createTask,
  CreateTaskInput,
  updateTask,
  UpdateTaskInput,
  completeTask,
  deleteTask,
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
      type: "create_planet";
      input: CreatePlanetInput;
    }
  | {
      type: "update_planet";
      input: UpdatePlanetInput;
    }
  | {
      type: "delete_planet";
      input: { id: string };
    }
  | {
      type: "list_planets";
    }
  | {
      type: "get_planet";
      input: { id: string };
    }
  | {
      type: "create_collection";
      input: CreateCollectionInput;
    }
  | {
      type: "update_collection";
      input: { id: string; title?: string };
    }
  | {
      type: "delete_collection";
      input: { id: string };
    }
  | {
      type: "list_collections";
      input: { planetId: string };
    }
  | {
      type: "get_collection";
      input: { id: string };
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
      type: "delete_item";
      input: { id: string };
    }
  | {
      type: "get_item";
      input: { id: string };
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
      type: "delete_task";
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

    case "create_planet": {
      if (!action.input?.name) {
        throw new Error(
          "create_planet requires name"
        );
      }

      return await createPlanet(action.input);
    }

    case "update_planet": {
      if (!action.input?.id) {
        throw new Error(
          "update_planet requires id"
        );
      }

      return await updatePlanet(action.input);
    }

    case "delete_planet": {
      if (!action.input?.id) {
        throw new Error(
          "delete_planet requires id"
        );
      }

      return await deletePlanet(action.input.id);
    }

    case "list_planets":
      return await listPlanets();

    case "get_planet": {
      if (!action.input?.id) {
        throw new Error(
          "get_planet requires id"
        );
      }

      return await getPlanetById(action.input.id);
    }

    case "create_collection": {
      if (!action.input?.planetId || !action.input?.title) {
        throw new Error(
          "create_collection requires planetId and title"
        );
      }

      return await createCollection(action.input);
    }

    case "update_collection": {
      if (!action.input?.id) {
        throw new Error(
          "update_collection requires id"
        );
      }

      return await updateCollection(action.input);
    }

    case "delete_collection": {
      if (!action.input?.id) {
        throw new Error(
          "delete_collection requires id"
        );
      }

      return await deleteCollection(action.input.id);
    }

    case "list_collections": {
      if (!action.input?.planetId) {
        throw new Error(
          "list_collections requires planetId"
        );
      }

      return await listCollections(action.input.planetId);
    }

    case "get_collection": {
      if (!action.input?.id) {
        throw new Error(
          "get_collection requires id"
        );
      }

      return await getCollectionById(action.input.id);
    }

    case "create_item": {
      if (
        !action.input?.collectionId ||
        !action.input?.title
      ) {
        throw new Error(
          "create_item requires collectionId and title"
        );
      }

      return await createItem(action.input);
    }

    case "update_item": {
      if (!action.input?.id) {
        throw new Error(
          "update_item requires id"
        );
      }

      return await updateItem(action.input);
    }

    case "delete_item": {
      if (!action.input?.id) {
        throw new Error(
          "delete_item requires id"
        );
      }

      return await deleteItem(action.input.id);
    }

    case "get_item": {
      if (!action.input?.id) {
        throw new Error(
          "get_item requires id"
        );
      }

      return await getItemById(action.input.id);
    }

    case "create_task": {
      if (!action.input?.title) {
        throw new Error(
          "create_task requires title"
        );
      }

      return await createTask(action.input);
    }

    case "update_task": {
      if (!action.input?.id) {
        throw new Error(
          "update_task requires id"
        );
      }

      return await updateTask(action.input);
    }

    case "complete_task": {
      if (!action.input?.id) {
        throw new Error(
          "complete_task requires id"
        );
      }

      return await completeTask(action.input.id);
    }

    case "delete_task": {
      if (!action.input?.id) {
        throw new Error(
          "delete_task requires id"
        );
      }

      return await deleteTask(action.input.id);
    }

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
