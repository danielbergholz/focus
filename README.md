# Foco — TanStack Start

App fullstack de tarefas com React, TypeScript, TanStack Start, Drizzle ORM e SQLite. Biome cuida do lint e da formatação.

## Executar

Requer Node.js 22.12+ e npm. Execute os comandos a partir desta pasta:

```sh
npm ci
cp .env.example .env
npm run dev
```

Abra http://localhost:3000. As migrações são aplicadas automaticamente antes do servidor iniciar. O banco fica em `data/app.sqlite` e está fora do Git; `DATABASE_URL` permite mudar o caminho.

Você pode criar, editar, concluir, reabrir, excluir, filtrar e buscar tarefas. As mudanças passam por funções de servidor com validação Zod. Este é um app pessoal local, sem autenticação ou isolamento por usuário.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Aplica migrações e inicia o desenvolvimento na porta 3000 |
| `npm run check` | Verifica lint e formatação com Biome |
| `npm run format` | Corrige lint e formatação |
| `npm run typecheck` | Verifica os tipos TypeScript |
| `npm test` | Testa CRUD, persistência, validação e entradas SQL em bancos isolados |
| `npm run db:generate` | Gera migrações após alterar o schema |
| `npm run db:migrate` | Aplica migrações pendentes |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run build` | Gera o servidor Node e os arquivos do cliente com Nitro |
| `npm start` | Aplica migrações e executa o build de produção |

Para executar em produção local:

```sh
npm run build
npm start
```

O servidor de produção usa a porta 3000 por padrão. Para mudar, use `PORT=3001 npm start`.

O build usa `better-sqlite3`, um módulo nativo: gere/instale as dependências no mesmo sistema operacional e arquitetura do servidor final. Em produção, mantenha o arquivo SQLite em um volume persistente.

## Estrutura

```text
src/routes/                 Telas, layout e loader SSR
src/server/tasks.ts         Funções de servidor chamadas pelo React
src/server/task-input.ts    Validação de entrada
src/server/task-repository.ts  CRUD com Drizzle
src/db/                     Schema e conexão SQLite
scripts/migrate.ts          Aplicação das migrações
drizzle/                    Migrações SQL versionadas
```

Referências: [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch), [Drizzle](https://orm.drizzle.team/docs/get-started-sqlite).
