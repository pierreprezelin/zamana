# Zamana

Monorepo: `apps/mobile` (Expo), `apps/api` (Express + tRPC), `apps/site` (Astro). Each app has its own `AGENTS.md` for its stack and rules.

## Workflow (Definition of Done)

1. **Spec**, for features and non-trivial bug fixes: in plan mode, propose the goal, behavior, edge cases, acceptance criteria and the list of tests to write. No code before the plan is approved. Never commit a spec file.
   Purely visual tweaks (spacing, wording, colors) skip the spec and TDD.
2. **Red tests**: write the tests for the critical logic (hooks, stores, schemas, utils, tRPC procedures), run them and show they fail for the right reason. For a bug fix, first write a test that reproduces the bug.
3. **Minimal code** to get green, then refactor.
4. `bun run verify` must pass.
5. **Review**, in parallel: `/code-review` on the diff, always. Add depending on what the diff touches:
   - `security-reviewer` agent: API, storage (SQLite, zustand persistence), files and photos, permissions, deep links, dependencies;
   - `performance-auditor` agent: lists, images and photos, SQLite queries, app startup, animations, new dependencies.
6. Fix the findings, or explain in the chat why one is dismissed. Run `bun run verify` again.
7. **Never commit.** When Pierre asks, propose a split into atomic Conventional Commits (in English), stage the first group (`git add <files>`, or `git apply --cached` for part of a file), wait for Pierre to commit, then stage the next group when he says so.

Work happens on a branch created from `dev` (`feat/…`, `fix/…`), one topic per branch, merged back into `dev`. Small changes that fit no topic go directly on `dev`.
