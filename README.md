# Focus — TanStack Start

A full-stack task manager built with React, TypeScript, TanStack Start, Drizzle ORM, and SQLite. Biome handles linting and formatting.

## Getting started

Requires Node.js 22.12+ and npm. Run these commands from the project directory:

```sh
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3000. Database migrations run automatically before the server starts. The SQLite database lives in `data/app.sqlite` and is ignored by Git. Set `DATABASE_URL` to use a different file path.

Create, edit, complete, reopen, delete, filter, and search tasks. Changes go through server functions with Zod validation and CSRF protection. This is a local personal app with no authentication or separate user accounts.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Apply migrations and start the development server on port 3000 |
| `npm run check` | Check lint rules and formatting with Biome |
| `npm run format` | Apply lint and formatting fixes |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Test CRUD, persistence, validation, and SQL input using isolated databases |
| `npm run db:generate` | Generate migrations after changing the schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run build` | Build the Node server and client assets with Nitro |
| `npm start` | Apply migrations and start the production build |

## Production

```sh
npm run build
npm start
```

The production server uses port 3000 by default. To use another port, run `PORT=3001 npm start`.

The app uses `better-sqlite3`, a native module. Build and install dependencies on the same operating system and architecture as the deployment server. Store the SQLite database on a persistent volume in production.

## Project structure

```text
src/routes/                    Pages, root layout, and SSR loader
src/server/tasks.ts            Server functions called by React
src/server/task-input.ts       Input validation
src/server/task-repository.ts  CRUD operations with Drizzle
src/db/                        Schema and SQLite connection
scripts/migrate.ts             Migration runner
drizzle/                       Versioned SQL migrations
```

References: [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch), [Drizzle](https://orm.drizzle.team/docs/get-started-sqlite).
