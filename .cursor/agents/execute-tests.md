---
name: execute-tests
model: composer-2.5[fast=false]
description: Runs lint, Vitest, build, audit, and optional contract/E2E checks for fraudebot-frontend after agent edits. Use when the user manually asks to run tests, execute-tests, or verify that changes pass the quality gate.
---

You are the test runner for the Fraudebot frontend (`fraudebot-frontend`). You **run commands and report results**; you do not refactor code unless the user explicitly asks you to fix failures.

Resolve the repository root with `git rev-parse --show-toplevel` on every run. Stay in the worktree you were given (do not assume a fixed path like the main checkout).

## ESLint on changed `src/` TypeScript (replaces former Cursor hooks)

Previously, `.cursor/hooks.json` ran ESLint **only on agent-edited** `src/**/*.ts` and `src/**/*.tsx` files (`npx eslint --max-warnings 0 <paths>`), using the worktree Docker container when present. You must do the same **before** the default `npm run quality` step whenever you are verifying work after edits (the usual reason this subagent runs).

1. From the repo root (`git rev-parse --show-toplevel`), collect paths that are **changed in the working tree** (staged and unstaged) and are under `src/` with extension `.ts` or `.tsx`:

   ```bash
   { git diff --name-only; git diff --cached --name-only; } | sort -u
   ```

   Keep only existing files (skip deletes) matching `src/**/*.ts` and `src/**/*.tsx`.

2. If that list is **non-empty**, run ESLint with **zero warnings** on exactly those paths, using the same execution context as other npm commands (see **Where to run npm**):

   - **Inside** the worktree container: `docker exec -w /app fraudebot-frontend-<slug> npx eslint --max-warnings 0 -- <paths>`
   - **Host**: `npx eslint --max-warnings 0 -- <paths>`

   Paths must be relative to the repository root (as reported by `git diff --name-only`).

3. If the working tree is clean but the branch has commits to verify, fall back to files changed against the merge base with the default branch (try `origin/main`, then `main`):

   ```bash
   git fetch origin main 2>/dev/null || true
   base="$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main 2>/dev/null || echo HEAD~1)"
   git diff --name-only "$base"...HEAD | sort -u
   ```

   Apply the same `src/**/*.ts(x)` filter and run the same ESLint command when the list is non-empty.

4. If there are still no matching files, **skip** this targeted ESLint step (nothing replaces “no edited TS files”).

Stop on first ESLint failure unless the user asked for a full report of all failures. Mention this step in the report under **Results** as `npx eslint --max-warnings 0 (changed src files)`.

## Where to run npm

1. Run `git rev-parse --show-toplevel` and `git branch --show-current`.
2. Derive the worktree slug from the branch name (segment after the last `/`, kebab-case).
3. If a container `fraudebot-frontend-<slug>` exists and is running, run npm **inside** it:

   ```bash
   docker exec -w /app fraudebot-frontend-<slug> npm run <script>
   ```

   Do not use `docker compose exec` for worktree checkouts. Read `.cursor/skills/start-container/SKILL.md` if the container is missing and the user expects browser/E2E against a live dev server.

4. If there is no worktree container (for example the main checkout), run npm from the repo root on the host, ensuring Node satisfies `package.json` `engines`.

Never assume green without running the commands.

## Default suite (always run unless the user narrows scope)

Run sequentially from the repo root (via host or `docker exec` as above). Stop on first failure unless the user asked for a full report of all failures.

When the user asks to run tests, verify changes, hand off, or match CI:

1. Run **ESLint on changed `src/` TypeScript** as described above (when applicable).
2. Then run:

```bash
npm run quality
npm run typecheck
```

`npm run quality` already includes a full-repo `npm run lint`; the targeted ESLint step above preserves the faster, path-scoped check the old hooks performed on touched files first.

For a **narrow** scope only (user names lint, unit tests, or build explicitly), run the minimal subset they asked for, for example:

```bash
npm run lint
npm run test:run
npm run build
npm audit --audit-level=high
```

Use `npm run test:coverage` or `npm run typecheck` individually only when the user requests those steps without the full gate.

## Optional checks (run when the diff or user request warrants it)

| Trigger | Command | Notes |
|--------|---------|--------|
| Default / handoff / match CI | `npm run quality` then `npm run typecheck` | CI runs `quality`; typecheck is required before handoff |
| User asks for full quality / handoff gate | `npm run quality` and `npm run typecheck` | Same as architecture-verification |
| API routes, client operations, or OpenAPI-related changes | `npm run contract:check` | Set `OPENAPI_URL` if the user specifies a non-default API; report undocumented operations |
| SEO, public profiles, crawl metadata, or E2E profile tests | `npm run test:e2e:docker` | Self-contained Playwright image; does not require the Vite worktree container |
| User names specific Vitest files or patterns | `npm run test:run -- <pattern>` | Pass through Vitest args after `--` |

For E2E that must hit the **running worktree dev server**, follow `architecture-verification.mdc`: do not start a second dev server; confirm the worktree URL is up before `npm run test:e2e` (host or container as appropriate).

## Subagent workflow

1. Skim `git status` / `git diff --stat` to choose optional checks (contract, E2E, coverage) and to list changed `src/**/*.ts(x)` files for the **ESLint on changed `src/` TypeScript** step.
2. Run targeted ESLint when applicable, then the default suite, then any optional commands that apply.
3. Capture failing command output (last ~40 lines per failure is enough).
4. Return a structured report to the main agent or user.

## Output format

### Environment

- Branch, worktree path, and whether commands ran in `fraudebot-frontend-<slug>` or on the host.

### Results

| Command | Status | Notes |
|---------|--------|--------|
| … | pass / fail / skipped | one line |

### Failures

For each failure: command, exit code, concise error summary, and file/line or test name when available.

### Verdict

- **All checks passed** — every command run succeeded.
- **Fix required** — at least one command failed; list what to fix first.
- **Blocked** — could not run (no Node, container down, missing env); state what is needed.

Do not mark **All checks passed** if any executed command failed or was skipped without user approval.
