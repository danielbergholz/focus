import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCheck,
  Circle,
  Leaf,
  ListTodo,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import type { Task } from "../db/schema";
import { createTask, deleteTask, listTasks, updateTask } from "../server/tasks";

export const Route = createFileRoute("/")({
  loader: () => listTasks(),
  component: TaskPage,
});
type Filter = "all" | "pending" | "completed";

function TaskPage() {
  const tasks = Route.useLoaderData();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const visible = tasks.filter(
    (task) =>
      (filter === "all" ||
        (filter === "completed" ? task.completed : !task.completed)) &&
      task.title
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );

  async function mutate(action: () => Promise<unknown>, after?: () => void) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      await router.invalidate();
      after?.();
    } catch {
      setError("Não foi possível salvar a alteração. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  function add(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    void mutate(
      () => createTask({ data: { title: nextTitle } }),
      () => {
        setTitle("");
        input.current?.focus();
      },
    );
  }

  function save(event: FormEvent, task: Task) {
    event.preventDefault();
    if (!editTitle.trim()) return;
    void mutate(
      () => updateTask({ data: { id: task.id, title: editTitle.trim() } }),
      () => setEditing(null),
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Foco, página inicial">
          <span className="brand-icon">
            <Leaf size={22} />
          </span>
          foco<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">SEU ESPAÇO</div>
        <nav aria-label="Filtrar tarefas">
          {(
            [
              ["all", "Todas as tarefas", ListTodo, tasks.length],
              ["pending", "Em aberto", Circle, pending],
              ["completed", "Concluídas", CheckCheck, completed],
            ] as const
          ).map(([value, label, Icon, count]) => (
            <button
              type="button"
              key={value}
              className={`nav-item ${filter === value ? "active" : ""}`}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <span className="nav-count">{count}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="little-sun">✳</span>
          <p>
            Grandes coisas começam
            <br />
            com pequenos passos.
          </p>
          <span className="local-note">
            <span /> Seu espaço pessoal
          </span>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span>
            Meu espaço <span className="breadcrumb-slash">/</span>{" "}
            <strong>Tarefas</strong>
          </span>
          <span className="topbar-note">
            Um passo de cada vez <Leaf size={14} />
          </span>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">MENOS RUÍDO, MAIS CLAREZA</p>
              <h1>
                Abra espaço para
                <br />o que importa<span>.</span>
              </h1>
              <p className="intro">
                Organize as ideias. Encontre seu ritmo. Faça acontecer.
              </p>
            </div>
            <div className="heading-art" aria-hidden="true">
              <span className="art-orbit" />
              <Leaf size={66} strokeWidth={1} />
              <span className="art-dot" />
            </div>
          </div>

          <section className="overview" aria-label="Resumo das tarefas">
            <div className="overview-stat">
              <span className="stat-label">NO SEU RADAR</span>
              <strong>
                {String(pending).padStart(2, "0")}
                <span>
                  {pending === 1 ? "tarefa em aberto" : "tarefas em aberto"}
                </span>
              </strong>
            </div>
            <div className="overview-stat">
              <span className="stat-label">JÁ ACONTECEU</span>
              <strong>
                {String(completed).padStart(2, "0")}
                <span>
                  {completed === 1 ? "tarefa concluída" : "tarefas concluídas"}
                </span>
              </strong>
            </div>
            <div className="overview-progress">
              <div>
                <span className="stat-label">SEU PROGRESSO</span>
                <strong>{progress}%</strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Tarefas concluídas"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              <p>
                {tasks.length && pending === 0
                  ? "Tudo em dia. Aproveite a pausa."
                  : "Cada pequena conquista conta."}
              </p>
            </div>
          </section>

          <section className="task-section" aria-labelledby="task-heading">
            <div className="section-heading">
              <h2 id="task-heading">
                Suas tarefas <span>{tasks.length}</span>
              </h2>
              <button
                className="text-button"
                type="button"
                onClick={() => input.current?.focus()}
              >
                Nova tarefa <Plus size={16} />
              </button>
            </div>
            <form className="add-form" onSubmit={add}>
              <Plus size={19} aria-hidden="true" />
              <label className="sr-only" htmlFor="new-task">
                Nova tarefa
              </label>
              <input
                ref={input}
                id="new-task"
                placeholder="O que você quer fazer?"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                required
                disabled={busy}
              />
              <button type="submit" disabled={busy || !title.trim()}>
                Adicionar <ArrowUpRight size={16} />
              </button>
            </form>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="list-toolbar">
              <nav className="filter-tabs" aria-label="Visualização">
                {(
                  [
                    ["all", "Todas"],
                    ["pending", "Em aberto"],
                    ["completed", "Concluídas"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={filter === value}
                    className={filter === value ? "selected" : ""}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <label className="search">
                <Search size={15} />
                <span className="sr-only">Buscar tarefas</span>
                <input
                  placeholder="Buscar tarefa"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
            <div className="list-caption">
              <span>TAREFA</span>
              <span>
                MAIS RECENTES <ArrowDown size={12} />
              </span>
            </div>
            <ul
              className="task-list"
              aria-label="Lista de tarefas"
              aria-busy={busy}
            >
              {visible.map((task) => (
                <li
                  key={task.id}
                  className={`task-row ${task.completed ? "done" : ""}`}
                >
                  <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    disabled={busy}
                    aria-label={`Concluir: ${task.title}`}
                    onChange={(event) => {
                      void mutate(() =>
                        updateTask({
                          data: {
                            id: task.id,
                            completed: event.target.checked,
                          },
                        }),
                      );
                    }}
                  />
                  {editing === task.id ? (
                    <form
                      className="edit-form"
                      onSubmit={(event) => save(event, task)}
                    >
                      <input
                        aria-label="Editar título"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        required
                        maxLength={200}
                        disabled={busy}
                      />
                      <button
                        type="submit"
                        aria-label="Salvar título"
                        disabled={busy || !editTitle.trim()}
                      >
                        <Check size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Cancelar edição"
                        onClick={() => setEditing(null)}
                      >
                        <X size={17} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="task-title">{task.title}</span>
                      <span
                        className={`status-badge ${task.completed ? "finished" : ""}`}
                      >
                        {task.completed ? "Concluída" : "Em aberto"}
                      </span>
                      <div className="row-actions">
                        <button
                          type="button"
                          aria-label={`Editar: ${task.title}`}
                          disabled={busy}
                          onClick={() => {
                            setEditing(task.id);
                            setEditTitle(task.title);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Excluir: ${task.title}`}
                          disabled={busy}
                          onClick={() => {
                            void mutate(() =>
                              deleteTask({ data: { id: task.id } }),
                            );
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {visible.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">
                  {filter === "completed" ? (
                    <CheckCheck size={27} />
                  ) : (
                    <Leaf size={27} />
                  )}
                </span>
                <h3>
                  {search
                    ? "Nenhuma tarefa por aqui."
                    : filter === "completed"
                      ? "Suas conquistas vão aparecer aqui."
                      : filter === "pending" && tasks.length
                        ? "Tudo em dia por aqui."
                        : "Um começo leve."}
                </h3>
                <p>
                  {search
                    ? "Experimente buscar por outro termo."
                    : filter === "completed"
                      ? "Conclua uma tarefa para dar o primeiro passo."
                      : "Adicione uma tarefa e dê o próximo passo."}
                </p>
              </div>
            )}
            <footer className="list-footer">
              <span>
                {visible.length} {visible.length === 1 ? "tarefa" : "tarefas"}{" "}
                nesta visualização
              </span>
              <span>
                <Check size={13} /> Salvo no seu espaço
              </span>
            </footer>
          </section>
          <footer className="page-footer">
            <span>Feito para um dia com mais foco.</span>
            <Leaf size={15} />
          </footer>
        </main>
      </div>
    </div>
  );
}
