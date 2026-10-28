import { z } from "zod";

export const taskTitle = z
  .string()
  .trim()
  .min(1, "Enter a task title.")
  .max(200, "Use no more than 200 characters.");
export const dueDate = z.iso.date().nullable();
export const taskId = z.object({ id: z.uuid() });
export const createTaskInput = z.object({
  title: taskTitle,
  dueDate: dueDate.optional(),
});
export const updateTaskInput = z
  .object({
    id: z.uuid(),
    title: taskTitle.optional(),
    completed: z.boolean().optional(),
    dueDate: dueDate.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.completed !== undefined ||
      data.dueDate !== undefined,
    "Provide at least one change.",
  );
