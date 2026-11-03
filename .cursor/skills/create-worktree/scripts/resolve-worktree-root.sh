#!/usr/bin/env bash
# Print the directory where Cursor frontend worktrees are created (one path, no newline issues).
# Usage: resolve-worktree-root.sh [main-repo-dir]
set -euo pipefail

main_repo="${1:-/home/cedano/projects/fraudebot/fraudebot-frontend}"

if [[ -n "${FRAUDEBOT_WORKTREE_ROOT:-}" ]]; then
  printf '%s' "${FRAUDEBOT_WORKTREE_ROOT}"
  exit 0
fi

if ! git -C "${main_repo}" rev-parse --git-dir >/dev/null 2>&1; then
  echo "resolve-worktree-root: not a git repo: ${main_repo}" >&2
  exit 1
fi

main_real="$(realpath -m "${main_repo}")"
parent=""

while IFS= read -r wt_path; do
  [[ -n "${wt_path}" ]] || continue
  wt_real="$(realpath -m "${wt_path}")"
  [[ "${wt_real}" == "${main_real}" ]] && continue
  case "${wt_real}" in
    *"/.cursor/worktrees/"*)
      candidate="$(dirname "${wt_real}")"
      if [[ -z "${parent}" ]]; then
        parent="${candidate}"
      elif [[ "${parent}" != "${candidate}" ]]; then
        echo "resolve-worktree-root: multiple worktree parents found; set FRAUDEBOT_WORKTREE_ROOT." >&2
        exit 1
      fi
      ;;
  esac
done < <(git -C "${main_repo}" worktree list --porcelain | awk '/^worktree / { print $2 }')

if [[ -n "${parent}" ]]; then
  printf '%s' "${parent}"
  exit 0
fi

default="/home/cedano/.cursor/worktrees/fraudebot-frontend__WSL__Ubuntu_"
if [[ -d "${default}" ]]; then
  printf '%s' "${default}"
  exit 0
fi

echo "resolve-worktree-root: set FRAUDEBOT_WORKTREE_ROOT to your Cursor worktrees folder." >&2
exit 1
