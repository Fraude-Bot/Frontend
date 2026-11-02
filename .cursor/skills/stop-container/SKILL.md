---
name: stop-container
description: >-
  Stops and removes the Fraudebot frontend Vite Docker container for the
  current Git worktree (fraudebot-frontend-<slug>). Use when the user runs
  /stop-container, asks to turn off the worktree dev server, or shut down
  the container started by start-container for this checkout.
disable-model-invocation: true
icon: container
---

# Worktree frontend container

Stop the Vite container **start-container** created for the worktree this session is on.

Leave the main Compose project running. Do **not** stop `fraudebot-frontend-1`, `fraudebot-backend-1`, `fraudebot-web-1`, `fraudebot-db-1`, or `fraudebot-cache-1`.

## When to run

Run from the same frontend worktree that started the container, not from the main checkout at `/home/cedano/projects/fraudebot/fraudebot-frontend`.

Confirm the session checkout:

```bash
git rev-parse --show-toplevel
git branch --show-current
```

Derive the slug from the branch name after the last `/`. It must be kebab-case. If it is not, stop and ask for a proper branch name.

The container name is `fraudebot-frontend-<slug>`. When `docker container inspect` reports it does not exist, tell the user nothing is running for this branch and stop.

## Stop the container

Execute this script. Do not run ad hoc `docker stop` on Compose service names.

```bash
bash .cursor/skills/stop-container/scripts/stop-worktree.sh [worktree-dir]
```

Run it from the worktree root. When omitted, `[worktree-dir]` defaults to the current directory. The script reads the branch of that checkout and refuses the main worktree.

It stops and removes `fraudebot-frontend-<slug>`, then removes the dedicated network `fraudebot-frontend-wt-<slug>` when nothing else uses it.

It keeps the `fraudebot-frontend-node-modules-<slug>` volume so **start-container** can reuse `node_modules` on the next start. Do not remove that volume unless the user explicitly asks.

Do not edit `.env.local` when stopping. **start-container** rewrites `VITE_API_PROXY_TARGET` on the next start.

## After it stops

Confirm the container is gone:

```bash
docker container inspect "fraudebot-frontend-<slug>"
```

That command should fail. Tell the user the worktree dev server is off and they can run **start-container** again when they need Vite.
