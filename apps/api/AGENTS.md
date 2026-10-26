# API

Express 5 + tRPC API for the Zamana app. The app lives in `../mobile`; check it to make sure an endpoint matches its usage.

## Stack

- TypeScript (ESM), run by Node with `nodemon` in dev
- Express 5 with `helmet`, `cors` and `morgan`; tRPC mounted on `/v1`
- Vitest for unit tests
- Bun as package manager

## Structure

- `app.ts`: Express configuration, testable without a port; `server.ts`: entry point
- `config/`: tRPC setup
- `routes/`: tRPC routers
- `controllers/`: procedure logic

## Rules

- Every new procedure validates its input with Zod and comes with its tests.
- Return error codes, never user-facing strings (the app translates them).
- Update `.gitignore` if needed.
