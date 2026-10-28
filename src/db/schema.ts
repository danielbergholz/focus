import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at").notNull(),
    dueDate: text("due_date"),
  },
  (table) => [
    check(
      "tasks_title_length",
      sql`length(trim(${table.title})) between 1 and 200`,
    ),
  ],
);

export type Task = typeof tasks.$inferSelect;
