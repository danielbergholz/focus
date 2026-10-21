import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openDatabase } from "../db/connection";
import { taskRepository } from "./task-repository";

test("CRUD persiste no SQLite após fechar e reabrir a conexão", () => {
  const directory = mkdtempSync(join(tmpdir(), "foco-test-"));
  const filename = join(directory, "test.sqlite");
  let connection = openDatabase(filename);
  try {
    migrate(connection.db, { migrationsFolder: "./drizzle" });
    const repository = taskRepository(connection.db);
    const created = repository.create({ title: "  Minha primeira tarefa  " });
    assert.equal(created.title, "Minha primeira tarefa");
    assert.equal(created.completed, false);
    repository.update({
      id: created.id,
      title: "Tarefa editada",
      completed: true,
    });
    connection.client.close();
    connection = openDatabase(filename);
    const reopened = taskRepository(connection.db);
    assert.deepEqual(reopened.list(), [
      { ...created, title: "Tarefa editada", completed: true },
    ]);
    reopened.update({ id: created.id, completed: false });
    assert.equal(reopened.list()[0].completed, false);
    reopened.delete({ id: created.id });
    assert.deepEqual(reopened.list(), []);
    assert.throws(
      () => reopened.update({ id: created.id, title: "Inexistente" }),
      /não encontrada/,
    );
  } finally {
    connection.client.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejeita entradas inválidas e trata SQL como texto", () => {
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
