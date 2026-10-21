import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Focus — one step at a time" },
      {
        name: "description",
        content: "A calm space to organize your tasks.",
      },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  component: () => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
  errorComponent: ({ reset }) => (
    <main className="fallback">
      <h1>Could not load your tasks.</h1>
      <p>Check your connection and try again.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  ),
  notFoundComponent: () => (
    <main className="fallback">
      <h1>Page not found.</h1>
      <a href="/">Back to tasks</a>
    </main>
  ),
});
