import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "../db/schema";
import { tasks } from "../db/schema";
import { createTaskInput, taskId, updateTaskInput } from "./task-input";

export function taskRepository(db: BetterSQLite3Database<typeof schema>) {
  return {
    list() {
      return db
        .select()
        .from(tasks)
        .orderBy(desc(tasks.createdAt), desc(tasks.id))
        .all();
    },
    create(input: unknown) {
      const data = createTaskInput.parse(input);
      return db
        .insert(tasks)
        .values({ id: randomUUID(), title: data.title, createdAt: Date.now() })
        .returning()
        .get();
    },
    update(input: unknown) {
      const { id, ...changes } = updateTaskInput.parse(input);
      const result = db
        .update(tasks)
        .set(changes)
        .where(eq(tasks.id, id))
        .returning()
        .get();
      if (!result) throw new Error("Task not found.");
      return result;
    },
    delete(input: unknown) {
      const { id } = taskId.parse(input);
      const result = db.delete(tasks).where(eq(tasks.id, id)).returning().get();
      if (!result) throw new Error("Task not found.");
      return { id: result.id };
    },
  };
}
