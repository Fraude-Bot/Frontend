#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8081}"
REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")

declare -a WORKTREE_PATHS=()
declare -a WORKTREE_LABELS=()

while IFS= read -r worktree_path; do
  if [[ "$worktree_path" != "$REPO_ROOT/worktrees/"* ]]; then
    continue
  fi

  workspace_name=$(basename "$worktree_path")
  branch=$(git -C "$worktree_path" branch --show-current 2>/dev/null || echo "detached")
  label="${workspace_name} (${branch})"
  WORKTREE_PATHS+=("$worktree_path")
  WORKTREE_LABELS+=("$label")
done < <(git worktree list --porcelain | awk '/^worktree / {print $2}')

if [ "${#WORKTREE_PATHS[@]}" -eq 0 ]; then
  echo "No Git worktrees found under worktrees/." >&2
  exit 1
fi

if [ "${#WORKTREE_PATHS[@]}" -eq 1 ]; then
  WORKTREE_PATH="${WORKTREE_PATHS[0]}"
  echo "Using worktree: ${WORKTREE_LABELS[0]}"
else
  echo "Select a Git worktree to turn on:"
  PS3="Enter number: "
  select WORKTREE_LABEL in "${WORKTREE_LABELS[@]}"; do
    if [ -n "${WORKTREE_LABEL:-}" ]; then
      index=$((REPLY - 1))
      WORKTREE_PATH="${WORKTREE_PATHS[$index]}"
      break
    fi
    echo "Invalid selection." >&2
  done
fi

WORKSPACE_NAME=$(basename "$WORKTREE_PATH")

if [ ! -f "$WORKTREE_PATH/package.json" ]; then
  echo "Missing package.json in $WORKTREE_PATH" >&2
  exit 1
fi

CONTAINER_NAME="fraudebot-frontend-$WORKSPACE_NAME"
VOLUME_NAME="fraudebot-worktree-$WORKSPACE_NAME-node-modules"

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run --detach \
  --name "$CONTAINER_NAME" \
  --network fraudebot_default \
  -p "$PORT:80" \
  -v "$WORKTREE_PATH:/app" \
  -v "$VOLUME_NAME:/app/node_modules" \
  -w /app \
  -e HOME=/tmp \
  -e NPM_CONFIG_CACHE=/tmp/.npm \
  -e VITE_API_PROXY_TARGET=http://web:80 \
  node:20-alpine \
  sh -c "if [ -f package.json ]; then npm install && npm run dev; else tail -f /dev/null; fi"

echo "Started $CONTAINER_NAME at http://localhost:$PORT"
