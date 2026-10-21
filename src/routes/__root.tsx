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
      { title: "Foco — um passo de cada vez" },
      {
        name: "description",
        content: "Um espaço tranquilo para organizar suas tarefas.",
      },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  component: () => (
    <html lang="pt-BR">
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
      <h1>Não foi possível carregar suas tarefas.</h1>
      <p>Confira a conexão e tente novamente.</p>
      <button type="button" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  ),
  notFoundComponent: () => (
    <main className="fallback">
      <h1>Página não encontrada.</h1>
      <a href="/">Voltar para as tarefas</a>
    </main>
  ),
});
