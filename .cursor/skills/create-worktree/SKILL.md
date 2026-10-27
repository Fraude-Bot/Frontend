---
name: create-worktree
description: >-
  Asks for the new branch name, the frontend host port, and the backend host
  port, then starts the Fraudebot frontend Docker container for a Cursor Agent
  worktree. Use when Cursor creates a Git worktree with the worktree button,
  when an Agent session starts in a new worktree, or when the user runs
  /create-worktree.
disable-model-invocation: true
icon: git-branch
---

# Cursor agent worktrees

When Cursor creates a Git worktree for an Agent, ask for the new branch name, the frontend port, and the backend port, then start the frontend container for that checkout. Do this before editing application code.

The worktree button, the Agents Window, and `/create-worktree` create the checkout. This skill starts its container. Leave the main Compose project running. The main API stays on port 9000. This skill does not start backend containers.

## Ask for the branch and both ports

Ask for three values and wait for the answer:

- The full branch name (`feature/support-tab`, `fix/payment-methods`).
- The frontend host port. This is the port the browser opens.
- The backend host port. This is the API this checkout calls. The main API is **9000**. A backend worktree uses the port its start script printed.

Skip a value only when the user already gave it in this conversation. Use the branch name as given. Do not add a `feature/` prefix they did not use, and do not invent a name from the task. Do not pick a free port yourself.

The container slug is the branch name after the last `/`. It must be kebab-case. If it is not, ask again.

Rename this chat to the branch name, exactly as given (feature/support-tab).

## Use the checkout Cursor created

Cursor creates the Git worktree and chooses its directory. Leave that path alone. Do not run `git worktree add`, and do not create a `worktrees/` directory inside the repository.

From the checkout Cursor opened (`git rev-parse --show-toplevel`):

```bash
git checkout -b "<branch>"
```

When that branch already exists, use `git checkout "<branch>"` instead. If Git reports the branch is already checked out somewhere else, stop and tell the user. Leave any branch Cursor generated in place.

The main checkout is `/home/cedano/projects/fraudebot/fraudebot-frontend`. When `git rev-parse --show-toplevel` is that path, stay in this conversation. Pass the worktree path Cursor created as the last argument to the start script. Do not ask the user to switch sessions, chats, or windows.

## Start the container

Execute this script. Do not rebuild the `docker run` flags by hand.

```bash
bash .cursor/skills/create-worktree/scripts/start-worktree.sh <frontend-port> <backend-port>
```

Run it with the worktree as the current directory, or pass that directory as the last argument. The script reads the current branch.

It writes `VITE_API_PROXY_TARGET` in this checkout's `.env.local`, using the Docker bridge gateway so Vite inside the container can reach the API published on the backend host port. The browser still opens the frontend host port and calls `/api`, which Vite proxies.

The script refuses frontend host ports **80**, **9000**, **3306**, and **6379**, and it refuses a frontend port that is already in use. The backend port may be **9000**. It does not `docker compose up`, and it does not stop `fraudebot-web-1`, `fraudebot-backend-1`, `fraudebot-frontend-1`, `fraudebot-db-1`, or `fraudebot-cache-1`.

If the script reports that `fraudebot-frontend-<slug>` already exists, leave that container as it is.

Do not run `npm run dev` on the host, and do not run `.vscode/scripts/turn-on-workspace.sh`. The image is `node:22-bookworm-slim`.

## After it is up

Use the worktree container, not `docker compose exec`:

```bash
docker exec -w /app fraudebot-frontend-<slug> npm run test:run
```

Tell the user the URL printed by the script. `npm ci` finishes before Vite listens. If the URL does not answer yet, follow `docker logs` for `fraudebot-frontend-<slug>`.
