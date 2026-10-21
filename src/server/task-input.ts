import { z } from "zod";

export const taskTitle = z
  .string()
  .trim()
  .min(1, "Escreva o título da tarefa.")
  .max(200, "Use no máximo 200 caracteres.");
export const taskId = z.object({ id: z.uuid() });
export const createTaskInput = z.object({ title: taskTitle });
export const updateTaskInput = z
  .object({
    id: z.uuid(),
    title: taskTitle.optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.completed !== undefined,
    "Informe uma alteração.",
  );
