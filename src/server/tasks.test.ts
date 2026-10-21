import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openDatabase } from "../db/connection";
import { taskRepository } from "./task-repository";

test("CRUD changes persist in SQLite after reopening the connection", () => {
  const directory = mkdtempSync(join(tmpdir(), "focus-test-"));
  const filename = join(directory, "test.sqlite");
  let connection = openDatabase(filename);
  try {
    migrate(connection.db, { migrationsFolder: "./drizzle" });
    const repository = taskRepository(connection.db);
    const created = repository.create({ title: "  My first task  " });
    assert.equal(created.title, "My first task");
    assert.equal(created.completed, false);
    repository.update({
      id: created.id,
      title: "Updated task",
      completed: true,
    });
    connection.client.close();
    connection = openDatabase(filename);
    const reopened = taskRepository(connection.db);
    assert.deepEqual(reopened.list(), [
      { ...created, title: "Updated task", completed: true },
    ]);
    reopened.update({ id: created.id, completed: false });
    assert.equal(reopened.list()[0].completed, false);
    reopened.delete({ id: created.id });
    assert.deepEqual(reopened.list(), []);
    assert.throws(
      () => reopened.update({ id: created.id, title: "Missing task" }),
      /not found/,
    );
  } finally {
    connection.client.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejects invalid input and treats SQL as text", () => {
  const { db, client } = openDatabase(":memory:");
  try {
    migrate(db, { migrationsFolder: "./drizzle" });
    const repository = taskRepository(db);
    for (const title of ["", "   ", "x".repeat(201), null, 123]) {
      assert.throws(() => repository.create({ title }));
    }
    const created = repository.create({ title: "'); DROP TABLE tasks; --" });
    assert.equal(repository.list().length, 1);
    assert.throws(() => repository.update({ id: created.id }));
    assert.throws(() =>
      repository.update({ id: created.id, completed: "true" }),
    );
    assert.throws(() => repository.delete({ id: "invalid" }));
    assert.equal(repository.list()[0].title, created.title);
  } finally {
    client.close();
  }
});
