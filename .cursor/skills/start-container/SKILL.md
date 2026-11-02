---
name: start-container
description: >-
  Starts the Fraudebot frontend Vite Docker container for the current Git
  worktree after asking for the frontend and backend host ports. Use when
  this session is on a frontend worktree and fraudebot-frontend-<slug> is
  not running, when the user runs /start-container, asks to turn on the
  worktree dev server, or gives frontend and backend ports for the checkout.
disable-model-invocation: true
icon: container
---

# Worktree frontend container

Start the Vite container for the worktree this session is on. Do this before editing application code when nothing is serving that checkout.

Leave the main Compose project running. The main API stays on port **9000**. This skill does not start backend containers.

## When to run

Run only from a frontend worktree, not from the main checkout at `/home/cedano/projects/fraudebot/fraudebot-frontend`.

Confirm the session is on the worktree:

```bash
git rev-parse --show-toplevel
git branch --show-current
```

Derive the slug from the branch name after the last `/`. It must be kebab-case. If it is not, stop and ask for a proper branch name.

Check whether the worktree container already exists:

```bash
docker container inspect "fraudebot-frontend-<slug>" >/dev/null 2>&1
```

When that succeeds and the container is running, tell the user which URL to open and stop. Do not start a second container.

When there is no container, or it exists but is not running and the user asked to start it, continue below.

## Ask for both ports

Ask for two values and wait for the answer:

- The frontend host port. This is the port the browser opens.
- The backend host port. This is the API this checkout calls. The main API is **9000**. A backend worktree uses the port its start script printed.

Skip a value only when the user already gave it in this conversation. Do not pick a free port yourself.

## Start the container

Execute this script. Do not rebuild the `docker run` flags by hand.

```bash
bash .cursor/skills/start-container/scripts/start-worktree.sh <frontend-port> <backend-port> [worktree-dir]
```

Run it from the worktree root. When omitted, `[worktree-dir]` defaults to the current directory. The script reads the branch of `<worktree-dir>`. It refuses the main worktree.

Ignore `~/.cursor/skills/create-worktree` and `start-worktree.py`. This repo's shell script is the one that takes both ports.

It writes `VITE_API_PROXY_TARGET` in the worktree's `.env.local`, using the Docker bridge gateway so Vite inside the container can reach the API published on the backend host port. The browser still opens the frontend host port and calls `/api`, which Vite proxies. Do not write that variable yourself.

Trust the backend port the user gave. Do not look for a backend container and do not start one. A worktree API on a port such as **9002** is normal.

The script refuses frontend host ports **80**, **9000**, **3306**, and **6379**, and it refuses a frontend port that is already in use. The backend port may be **9000**. It does not `docker compose up`, and it does not stop `fraudebot-web-1`, `fraudebot-backend-1`, `fraudebot-frontend-1`, `fraudebot-db-1`, or `fraudebot-cache-1`.

If the script reports that `fraudebot-frontend-<slug>` already exists, leave that container as it is unless the user asked to recreate it.

The script runs `npm ci` before Vite listens, and it waits up to about five minutes for the port. Run it in the foreground and give it at least six minutes. A short timeout is not a failure and is not a reason to start a second container. Do not run `npm run dev` on the host, and do not run `.vscode/scripts/turn-on-workspace.sh`. The image is `node:22-bookworm-slim`.

## After it is up

Use the worktree container, not `docker compose exec`:

```bash
docker exec -w /app fraudebot-frontend-<slug> npm run test:run
```

Tell the user the URL printed by the script. `npm ci` finishes before Vite listens. If the URL does not answer yet, follow `docker logs` for `fraudebot-frontend-<slug>`.
