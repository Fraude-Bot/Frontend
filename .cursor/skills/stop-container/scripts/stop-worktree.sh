#!/usr/bin/env bash
# Stop the frontend container for a Cursor Agent worktree.
# Usage: stop-worktree.sh [worktree-dir]
set -euo pipefail

if (($# > 1)); then
  echo "Usage: stop-worktree.sh [worktree-dir]" >&2
  exit 1
fi

worktree_dir="$(cd "${1:-.}" && pwd)"

if [[ ! -f "${worktree_dir}/package.json" ]]; then
  echo "Missing package.json in ${worktree_dir}. Run this from the frontend worktree." >&2
  exit 1
fi

main_worktree="$(git -C "${worktree_dir}" worktree list --porcelain | awk '/^worktree / { print substr($0, 10); exit }')"
if [[ -z "${main_worktree}" || ! -d "${main_worktree}" ]]; then
  echo "Could not find the main worktree for ${worktree_dir}." >&2
  exit 1
fi

if [[ "${worktree_dir}" == "${main_worktree}" ]]; then
  echo "Refusing to stop Compose containers from the main worktree (${main_worktree})." >&2
  exit 1
fi

branch="$(git -C "${worktree_dir}" branch --show-current)"
if [[ -z "${branch}" ]]; then
  echo "This worktree is not on a branch." >&2
  exit 1
fi

slug="${branch##*/}"
if [[ ! "${slug}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Branch '${branch}' must end in a kebab-case name (for example feature/support-tab)." >&2
  exit 1
fi

frontend_name="fraudebot-frontend-${slug}"
frontend_network="fraudebot-frontend-wt-${slug}"

protected=(fraudebot-frontend-1 fraudebot-backend-1 fraudebot-web-1 fraudebot-db-1 fraudebot-cache-1)
for name in "${protected[@]}"; do
  if [[ "${frontend_name}" == "${name}" ]]; then
    echo "Refusing to stop protected container ${name}." >&2
    exit 1
  fi
done

if ! docker container inspect "${frontend_name}" >/dev/null 2>&1; then
  echo "No worktree container ${frontend_name} to stop."
  exit 0
fi

running="$(docker inspect -f '{{.State.Running}}' "${frontend_name}" 2>/dev/null || echo false)"
if [[ "${running}" == "true" ]]; then
  docker stop "${frontend_name}" >/dev/null
  echo "Stopped ${frontend_name}."
else
  echo "Container ${frontend_name} was not running."
fi

docker rm "${frontend_name}" >/dev/null
echo "Removed ${frontend_name}."

if docker network inspect "${frontend_network}" >/dev/null 2>&1; then
  if docker network rm "${frontend_network}" >/dev/null 2>&1; then
    echo "Removed network ${frontend_network}."
  else
    echo "Left network ${frontend_network} in place (still in use)." >&2
  fi
fi

echo "Branch: ${branch}"
echo "Left volume fraudebot-frontend-node-modules-${slug} for faster restarts."
