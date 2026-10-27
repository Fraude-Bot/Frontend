---
name: create-worktree
description: >-
  Creates a Fraudebot frontend Git worktree when this chat is still on the
  main checkout, moves this session onto that worktree, and starts that
  checkout's Vite container on the frontend and backend ports they give.
  Use when the user runs /create-worktree, asks for a frontend worktree
  container, or gives a branch plus a frontend port and a backend port.
disable-model-invocation: true
icon: git-branch
---

# Cursor agent worktrees

When the user runs `/create-worktree`, get the branch and both ports, make sure a frontend worktree is on that branch, move this session from the main checkout onto that worktree, then start its container. Do this before editing application code.

The worktree button sometimes opens the agent already inside a new checkout. `/create-worktree` typed in the main repo does not. There is no hidden checkout to find. Create one, move this session onto it, then start the container from this same chat.

Leave the main Compose project running. The main API stays on port 9000. This skill does not start backend containers.

## Ask for the branch and both ports

Ask for three values and wait for the answer:

- The full branch name (`feature/support-tab`, `fix/payment-methods`).
- The frontend host port. This is the port the browser opens.
- The backend host port. This is the API this checkout calls. The main API is **9000**. A backend worktree uses the port its start script printed.

Skip a value only when the user already gave it in this conversation. Use the branch name as given. Do not add a `feature/` prefix they did not use, and do not invent a name from the task. Do not pick a free port yourself.

The container slug is the branch name after the last `/`. It must be kebab-case. If it is not, ask again.

Rename this chat to the branch name, exactly as given (feature/support-tab).

## Make sure the worktree exists

`git worktree list` is the inventory. One call is enough. Do not search the home directory or `~/.cursor/worktrees` for a checkout that might have been created. A missing checkout means create one.

The main checkout is `/home/cedano/projects/fraudebot/fraudebot-frontend`. Never check the feature branch out there. That moves the user's main working tree off `main`, and the start script refuses to launch a second stack for that path.

**Already inside a worktree.** When `git rev-parse --show-toplevel` is not the main checkout, that directory is the one to use. From there:

```bash
git checkout -b "<branch>"
```

When that branch already exists, use `git checkout "<branch>"` instead. If Git reports the branch is already checked out somewhere else, stop and tell the user which path has it. Leave any branch name Cursor already generated; after switching, that name can stay in the branch list.

**Still on the main checkout.** This is the usual `/create-worktree` case. Another worktree on a different branch belongs to another chat. Do not reuse it, and do not add the feature branch to it.

If `git worktree list` already shows the requested branch, use that path. Git allows a branch in only one checkout.

Otherwise create the worktree outside the repository, beside Cursor's other frontend worktrees. The directory name is the slug, so the path matches the container `fraudebot-frontend-<slug>` and the next session can find it from the branch alone:

```bash
mkdir -p /home/cedano/.cursor/worktrees/fraudebot-frontend__WSL__Ubuntu_
git worktree add -b "<branch>" \
  "/home/cedano/.cursor/worktrees/fraudebot-frontend__WSL__Ubuntu_/<slug>" \
  HEAD
```

When the branch already exists and is not checked out, drop `-b` and pass the branch name instead of `HEAD`:

```bash
git worktree add \
  "/home/cedano/.cursor/worktrees/fraudebot-frontend__WSL__Ubuntu_/<slug>" \
  "<branch>"
```

If that directory already exists and is not a worktree, stop and tell the user. Do not delete it.

Do not create a `worktrees/` directory inside the repository. Confirm the new checkout before starting the container:

```bash
git -C "<worktree>" rev-parse --show-toplevel
git -C "<worktree>" branch --show-current
```

Stay in this conversation. Do not ask the user to switch sessions, chats, or windows, and do not tell them to press the worktree button.

When this session is still on the main checkout, move it onto the new worktree before starting the container or editing anything. Call `move_agent_to_cloned_root` with the worktree's absolute path. That switches the workspace root to the new checkout and does not fetch the branch. Do not call `move_agent_to_root`. That tool runs `git fetch origin <branch>`, and a branch that exists only locally is not on origin, so the move fails. When `git rev-parse --show-toplevel` is already the worktree, skip this move.

After the move, confirm the session itself is on the worktree:

```bash
git rev-parse --show-toplevel
git branch --show-current
```

Both commands must report the new worktree path and the requested branch. If they still report the main checkout, stop and move the session again. Do not keep working from `main`.

Start the container from the worktree. Pass that path as the last argument to the start script. Do not edit application code in the main checkout.

**Example.** The user says `/create-worktree branch feature/organization-to-scammer, port 5172 and backend port 9002` while this chat is on the main checkout. The slug is `organization-to-scammer`. Create `/home/cedano/.cursor/worktrees/fraudebot-frontend__WSL__Ubuntu_/organization-to-scammer` on `feature/organization-to-scammer`, call `move_agent_to_cloned_root` with that path, confirm this session is on `feature/organization-to-scammer`, then start the container with `5172`, `9002`, and that path. A checkout on some other feature branch is not this one.

## Start the container

Execute this script. Do not rebuild the `docker run` flags by hand.

```bash
bash .cursor/skills/create-worktree/scripts/start-worktree.sh <frontend-port> <backend-port> <worktree-dir>
```

Run it from the worktree this session just moved to. The script reads the branch of `<worktree-dir>`. It refuses the main worktree, so a missing path is not something to fix by editing the script.

Ignore `~/.cursor/skills/create-worktree` and `start-worktree.py`. This repo's shell script is the one that takes both ports.

It writes `VITE_API_PROXY_TARGET` in the worktree's `.env.local`, using the Docker bridge gateway so Vite inside the container can reach the API published on the backend host port. The browser still opens the frontend host port and calls `/api`, which Vite proxies. Do not write that variable yourself.

Trust the backend port the user gave. Do not look for a backend container and do not start one. A worktree API on a port such as **9002** is normal.

The script refuses frontend host ports **80**, **9000**, **3306**, and **6379**, and it refuses a frontend port that is already in use. The backend port may be **9000**. It does not `docker compose up`, and it does not stop `fraudebot-web-1`, `fraudebot-backend-1`, `fraudebot-frontend-1`, `fraudebot-db-1`, or `fraudebot-cache-1`.

If the script reports that `fraudebot-frontend-<slug>` already exists, leave that container as it is.

The script runs `npm ci` before Vite listens, and it waits up to about five minutes for the port. Run it in the foreground and give it at least six minutes. A short timeout is not a failure and is not a reason to start a second container. Do not run `npm run dev` on the host, and do not run `.vscode/scripts/turn-on-workspace.sh`. The image is `node:22-bookworm-slim`.

## After it is up

Use the worktree container, not `docker compose exec`:

```bash
docker exec -w /app fraudebot-frontend-<slug> npm run test:run
```

Tell the user the URL printed by the script. `npm ci` finishes before Vite listens. If the URL does not answer yet, follow `docker logs` for `fraudebot-frontend-<slug>`.
