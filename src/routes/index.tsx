import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
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
import {
  type FormEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Task } from "../db/schema";
import { createTask, deleteTask, listTasks, updateTask } from "../server/tasks";

export const Route = createFileRoute("/")({
  loader: () => listTasks(),
  component: TaskPage,
});

type Filter = "all" | "pending" | "completed";

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDueDate(dueDate: string) {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TaskPage() {
  const tasks = Route.useLoaderData();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  async function mutate(action: () => Promise<unknown>, after?: () => void) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      await router.invalidate();
      after?.();
    } catch {
      setError("Could not save your changes. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Focus, home">
          <span className="brand-icon">
            <Leaf size={22} />
          </span>
          focus<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">YOUR SPACE</div>
        <nav aria-label="Filter tasks">
          {(
            [
              ["all", "All tasks", ListTodo, tasks.length],
              ["pending", "Open", Circle, pending],
              ["completed", "Completed", CheckCheck, completed],
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
            Great things start
            <br />
            with small steps.
          </p>
          <span className="local-note">
            <span /> Your personal space
          </span>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span>
            My workspace <span className="breadcrumb-slash">/</span>{" "}
            <strong>Tasks</strong>
          </span>
          <span className="topbar-note">
            One step at a time <Leaf size={14} />
          </span>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">LESS NOISE, MORE CLARITY</p>
              <h1>
                Make room for
                <br />
                what matters<span>.</span>
              </h1>
              <p className="intro">
                Organize your ideas. Find your rhythm. Make it happen.
              </p>
            </div>
            <div className="heading-art" aria-hidden="true">
              <span className="art-orbit" />
              <Leaf size={66} strokeWidth={1} />
              <span className="art-dot" />
            </div>
          </div>

          <section className="overview" aria-label="Task overview">
            <div className="overview-stat">
              <span className="stat-label">ON YOUR RADAR</span>
              <strong>
                {String(pending).padStart(2, "0")}
                <span>{pending === 1 ? "open task" : "open tasks"}</span>
              </strong>
            </div>
            <div className="overview-stat">
              <span className="stat-label">ALREADY DONE</span>
              <strong>
                {String(completed).padStart(2, "0")}
                <span>
                  {completed === 1 ? "completed task" : "completed tasks"}
                </span>
              </strong>
            </div>
            <div className="overview-progress">
              <div>
                <span className="stat-label">YOUR PROGRESS</span>
                <strong>{progress}%</strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Completed tasks"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              <p>
                {tasks.length && pending === 0
                  ? "All caught up. Enjoy a break."
                  : "Every small win counts."}
              </p>
            </div>
          </section>

          <section className="task-section" aria-labelledby="task-heading">
            <div className="section-heading">
              <h2 id="task-heading">
                Your tasks <span>{tasks.length}</span>
              </h2>
              <button
                className="text-button"
                type="button"
                onClick={() => input.current?.focus()}
              >
                New task <Plus size={16} />
              </button>
            </div>
            <AddTaskForm inputRef={input} busy={busy} mutate={mutate} />
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <TaskList
              tasks={tasks}
              filter={filter}
              onFilterChange={setFilter}
              busy={busy}
              mutate={mutate}
            />
          </section>
          <footer className="page-footer">
            <span>Made for a more focused day.</span>
            <Leaf size={15} />
          </footer>
        </main>
      </div>
    </div>
  );
}

// Owns the new-task draft so typing only re-renders the form, not the whole page.
function AddTaskForm({
  inputRef,
  busy,
  mutate,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  mutate: Mutate;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  function add(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    void mutate(
      () =>
        createTask({ data: { title: nextTitle, dueDate: dueDate || null } }),
      () => {
        setTitle("");
        setDueDate("");
        inputRef.current?.focus();
      },
    );
  }

  return (
    <form className="add-form" onSubmit={add}>
      <Plus size={19} aria-hidden="true" />
      <label className="sr-only" htmlFor="new-task">
        New task
      </label>
      <input
        ref={inputRef}
        id="new-task"
        placeholder="What would you like to do?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={200}
        required
        disabled={busy}
      />
      <label className="due-field">
        <CalendarDays size={15} aria-hidden="true" />
        <span className="sr-only">Due date (optional)</span>
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={busy}
        />
      </label>
      <button type="submit" disabled={busy || !title.trim()}>
        Add task <ArrowUpRight size={16} />
      </button>
    </form>
  );
}

type Mutate = (
  action: () => Promise<unknown>,
  after?: () => void,
) => Promise<void>;

// Owns the search text so typing only re-renders the list, not the whole page.
function TaskList({
  tasks,
  filter,
  onFilterChange,
  busy,
  mutate,
}: {
  tasks: Task[];
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  busy: boolean;
  mutate: Mutate;
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  // Set after mount so server and client render the same markup.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);
  const visible = tasks.filter(
    (task) =>
      (filter === "all" ||
        (filter === "completed" ? task.completed : !task.completed)) &&
      task.title
        .toLocaleLowerCase("en-US")
        .includes(search.toLocaleLowerCase("en-US")),
  );

  function save(event: FormEvent, task: Task) {
    event.preventDefault();
    if (!editTitle.trim()) return;
    void mutate(
      () =>
        updateTask({
          data: {
            id: task.id,
            title: editTitle.trim(),
            dueDate: editDueDate || null,
          },
        }),
      () => setEditing(null),
    );
  }

  return (
    <>
      <div className="list-toolbar">
        <nav className="filter-tabs" aria-label="View">
          {(
            [
              ["all", "All"],
              ["pending", "Open"],
              ["completed", "Completed"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? "selected" : ""}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </nav>
        <label className="search">
          <Search size={15} />
          <span className="sr-only">Search tasks</span>
          <input
            placeholder="Search tasks"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <div className="list-caption">
        <span>TASK</span>
        <span>
          NEWEST FIRST <ArrowDown size={12} />
        </span>
      </div>
      <ul className="task-list" aria-label="Task list" aria-busy={busy}>
        {visible.map((task) => {
          const overdue =
            !!task.dueDate &&
            !task.completed &&
            today !== null &&
            task.dueDate < today;
          return (
            <li
              key={task.id}
              className={`task-row ${task.completed ? "done" : ""} ${overdue ? "overdue" : ""}`}
            >
              <input
                className="task-checkbox"
                type="checkbox"
                checked={task.completed}
                disabled={busy}
                aria-label={`Complete: ${task.title}`}
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
                    aria-label="Edit title"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    required
                    maxLength={200}
                    disabled={busy}
                  />
                  <input
                    type="date"
                    aria-label="Edit due date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                    disabled={busy}
                  />
                  <button
                    type="submit"
                    aria-label="Save title"
                    disabled={busy || !editTitle.trim()}
                  >
                    <Check size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel editing"
                    onClick={() => setEditing(null)}
                  >
                    <X size={17} />
                  </button>
                </form>
              ) : (
                <>
                  <span className="task-title">
                    {task.title}
                    {task.dueDate && (
                      <time
                        className="due-badge"
                        dateTime={task.dueDate}
                        title={overdue ? "Overdue" : "Due date"}
                      >
                        <CalendarDays size={11} aria-hidden="true" />
                        {overdue && <span className="sr-only">Overdue: </span>}
                        {formatDueDate(task.dueDate)}
                      </time>
                    )}
                  </span>
                  <span
                    className={`status-badge ${task.completed ? "finished" : ""}`}
                  >
                    {task.completed ? "Completed" : "Open"}
                  </span>
                  <div className="row-actions">
                    <button
                      type="button"
                      aria-label={`Edit: ${task.title}`}
                      disabled={busy}
                      onClick={() => {
                        setEditing(task.id);
                        setEditTitle(task.title);
                        setEditDueDate(task.dueDate ?? "");
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete: ${task.title}`}
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
          );
        })}
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
              ? "No tasks found."
              : filter === "completed"
                ? "Your wins will show up here."
                : filter === "pending" && tasks.length
                  ? "You are all caught up."
                  : "A fresh start."}
          </h3>
          <p>
            {search
              ? "Try a different search term."
              : filter === "completed"
                ? "Complete a task to take the first step."
                : "Add a task and take the next step."}
          </p>
        </div>
      )}
      <footer className="list-footer">
        <span>
          {visible.length} {visible.length === 1 ? "task" : "tasks"} in this
          view
        </span>
        <span>
          <Check size={13} /> Saved to your workspace
        </span>
      </footer>
    </>
  );
}
