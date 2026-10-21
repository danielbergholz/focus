import { openDatabase } from "./connection";

const globalForDb = globalThis as typeof globalThis & {
  taskDatabase?: ReturnType<typeof openDatabase>;
};

const connection =
  globalForDb.taskDatabase ??
  openDatabase(process.env.DATABASE_URL ?? "./data/app.sqlite");
globalForDb.taskDatabase = connection;

export const db = connection.db;
