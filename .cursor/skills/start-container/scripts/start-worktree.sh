#!/usr/bin/env bash
# Start the frontend container for a Cursor Agent worktree.
# Points Vite at an API already published on the host.
# Usage: start-worktree.sh <frontend-port> <backend-port> [worktree-dir]
set -euo pipefail

port_forbidden() {
  case "$1" in
    80|9000|3306|6379) return 0 ;;
    *) return 1 ;;
  esac
}

port_in_use() {
  local port="$1"
  if port_forbidden "${port}"; then
    return 0
  fi
  if docker ps --format '{{.Ports}}' | grep -Eq "(^|[^0-9])${port}->"; then
    return 0
  fi
  if command -v ss >/dev/null 2>&1 && ss -ltn | awk '{print $4}' | grep -Eq ":${port}$"; then
    return 0
  fi
  return 1
}

require_port_number() {
  local label="$1"
  local port="$2"
  if [[ ! "${port}" =~ ^[0-9]+$ ]] || ((port < 1 || port > 65535)); then
    echo "${label} port must be a number from 1 to 65535." >&2
    exit 1
  fi
}

require_absent() {
  local name="$1"
  if docker container inspect "${name}" >/dev/null 2>&1; then
    echo "Container ${name} already exists. Leave it running, or remove it only if the user asked to recreate it." >&2
    exit 1
  fi
}

if (($# < 2 || $# > 3)); then
  echo "Usage: start-worktree.sh <frontend-port> <backend-port> [worktree-dir]" >&2
  exit 1
fi

frontend_port="$1"
backend_port="$2"
worktree_dir="$(cd "${3:-.}" && pwd)"

require_port_number "Frontend" "${frontend_port}"
require_port_number "Backend" "${backend_port}"

if port_forbidden "${frontend_port}"; then
  echo "Frontend port ${frontend_port} is reserved (80 main frontend, 9000 main API, 3306 MySQL, 6379 Redis)." >&2
  exit 1
fi

if [[ "${backend_port}" == "3306" || "${backend_port}" == "6379" ]]; then
  echo "Backend port ${backend_port} is MySQL or Redis, not the API." >&2
  exit 1
fi

if [[ "${frontend_port}" == "${backend_port}" ]]; then
  echo "Frontend and backend host ports must differ." >&2
  exit 1
fi

if port_in_use "${frontend_port}"; then
  echo "Frontend port ${frontend_port} is already in use." >&2
  exit 1
fi

if [[ ! -f "${worktree_dir}/package.json" || ! -f "${worktree_dir}/package-lock.json" ]]; then
  echo "Missing package.json or package-lock.json in ${worktree_dir}. Run this from the frontend worktree Cursor created." >&2
  exit 1
fi

main_worktree="$(git -C "${worktree_dir}" worktree list --porcelain | awk '/^worktree / { print substr($0, 10); exit }')"
if [[ -z "${main_worktree}" || ! -d "${main_worktree}" ]]; then
  echo "Could not find the main worktree for ${worktree_dir}." >&2
  exit 1
fi

if [[ "${worktree_dir}" == "${main_worktree}" ]]; then
  echo "Refusing to start a second stack for the main worktree (${main_worktree})." >&2
  exit 1
fi

branch="$(git -C "${worktree_dir}" branch --show-current)"
if [[ -z "${branch}" ]]; then
  echo "This worktree is not on a branch. Ask for the new branch name and check it out first." >&2
  exit 1
fi

slug="${branch##*/}"
if [[ ! "${slug}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Branch '${branch}' must end in a kebab-case name (for example feature/support-tab)." >&2
  exit 1
fi

frontend_name="fraudebot-frontend-${slug}"
frontend_network="fraudebot-frontend-wt-${slug}"
volume_name="fraudebot-frontend-node-modules-${slug}"

require_absent "${frontend_name}"

gateway="$(docker network inspect bridge --format '{{(index .IPAM.Config 0).Gateway}}')"
if [[ ! "${gateway}" =~ ^[0-9]+(\.[0-9]+){3}$ ]]; then
  echo "Could not read the Docker bridge gateway." >&2
  exit 1
fi

proxy_target="http://${gateway}:${backend_port}"
env_file="${worktree_dir}/.env.local"
if [[ -f "${env_file}" ]] && grep -q '^VITE_API_PROXY_TARGET=' "${env_file}"; then
  sed -i "s|^VITE_API_PROXY_TARGET=.*|VITE_API_PROXY_TARGET=${proxy_target}|" "${env_file}"
else
  printf 'VITE_API_PROXY_TARGET=%s\n' "${proxy_target}" >> "${env_file}"
fi

docker network inspect "${frontend_network}" >/dev/null 2>&1 || docker network create "${frontend_network}"

docker run --detach \
  --name "${frontend_name}" \
  --network "${frontend_network}" \
  -p "${frontend_port}:5173" \
  -v "${worktree_dir}:/app" \
  -v "${volume_name}:/app/node_modules" \
  -w /app \
  -e HOME=/tmp \
  -e NPM_CONFIG_CACHE=/tmp/.npm \
  node:22-bookworm-slim \
  sh -c "set -e; npm ci && npm run dev -- --host 0.0.0.0 --port 5173"

echo "Running npm ci and Vite in ${frontend_name}..."
ready=0
for _ in {1..150}; do
  if command -v ss >/dev/null 2>&1 && ss -ltn | awk '{print $4}' | grep -Eq ":${frontend_port}$"; then
    ready=1
    break
  fi
  running="$(docker inspect -f '{{.State.Running}}' "${frontend_name}" 2>/dev/null || echo false)"
  if [[ "${running}" != "true" ]]; then
    echo "Container ${frontend_name} exited before Vite listened." >&2
    docker logs --tail 40 "${frontend_name}" >&2 || true
    exit 1
  fi
  sleep 2
done

if ((ready == 0)); then
  echo "Vite has not opened port ${frontend_port} yet. Follow: docker logs -f ${frontend_name}" >&2
fi

echo "App: http://localhost:${frontend_port}"
echo "Branch: ${branch}"
echo "API proxy: host port ${backend_port} via ${proxy_target}"
echo "Env file: ${env_file}"

if docker container inspect fraudebot-frontend-1 >/dev/null 2>&1; then
  if ! docker port fraudebot-frontend-1 80 | grep -q ':80$'; then
    echo "Main frontend container fraudebot-frontend-1 is no longer published on port 80." >&2
    exit 1
  fi
fi
