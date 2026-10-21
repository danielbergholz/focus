import { createServerFn } from "@tanstack/react-start";
import { createTaskInput, taskId, updateTaskInput } from "./task-input";

async function repository() {
  const [{ db }, { taskRepository }] = await Promise.all([
    import("../db/index.server"),
    import("./task-repository"),
  ]);
  return taskRepository(db);
}

export const listTasks = createServerFn({ method: "GET" }).handler(async () =>
  (await repository()).list(),
);
export const createTask = createServerFn({ method: "POST" })
  .validator(createTaskInput)
  .handler(async ({ data }) => (await repository()).create(data));
export const updateTask = createServerFn({ method: "POST" })
  .validator(updateTaskInput)
  .handler(async ({ data }) => (await repository()).update(data));
export const deleteTask = createServerFn({ method: "POST" })
  .validator(taskId)
  .handler(async ({ data }) => (await repository()).delete(data));
