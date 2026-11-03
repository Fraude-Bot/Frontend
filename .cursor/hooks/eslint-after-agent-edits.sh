#!/usr/bin/env bash
# Track agent-edited src TS/TSX files and run ESLint on stop (worktree container or host).
set -uo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd -P)"
root_real="$(realpath -m "$root")"
input="$(cat)"

finish() {
  printf '%s\n' '{}'
  exit 0
}

if ! command -v python3 >/dev/null 2>&1; then
  echo "ESLint hook: python3 is not on PATH." >&2
  finish
fi

parsed="$(printf '%s' "$input" | python3 -c '
import json, sys
data = json.load(sys.stdin)
event = str(data.get("hook_event_name") or "")
conv = str(data.get("conversation_id") or "")
gen = str(data.get("generation_id") or "")
loop_count = int(data.get("loop_count") or 0)
paths = []
file_path = data.get("file_path")
if isinstance(file_path, str):
    paths.append(file_path)
modified = data.get("modified_files")
if isinstance(modified, list):
    paths.extend(str(path) for path in modified)

def is_src_ts(path: str) -> bool:
    p = path.replace("\\\\", "/")
    if "/src/" not in p:
        return False
    lower = p.lower()
    return lower.endswith(".ts") or lower.endswith(".tsx")

tracked = [p for p in paths if is_src_ts(p)]
print(event)
print(conv)
print(gen)
print(loop_count)
print("1" if tracked else "0")
for p in tracked:
    print(p)
')"

event="$(sed -n '1p' <<<"$parsed")"
conversation_id="$(sed -n '2p' <<<"$parsed")"
generation_id="$(sed -n '3p' <<<"$parsed")"
loop_count="$(sed -n '4p' <<<"$parsed")"
has_src="$(sed -n '5p' <<<"$parsed")"
mapfile -t edited_paths < <(sed -n '6,$p' <<<"$parsed")

safe() {
  printf '%s' "$1" | tr -c 'A-Za-z0-9._-' '_'
}

state_dir="/tmp/fraudebot-eslint-edits/$(safe "$root_real")/$(safe "$conversation_id")/$(safe "$generation_id")"
list_file="${state_dir}/files"

if [[ "$event" == "afterFileEdit" ]]; then
  if [[ "$has_src" == "1" && -n "$conversation_id" && -n "$generation_id" ]]; then
    mkdir -p "$state_dir"
    for path in "${edited_paths[@]}"; do
      [[ -n "$path" ]] && printf '%s\n' "$path" >>"$list_file"
    done
    if [[ -f "$list_file" ]]; then
      sort -u "$list_file" -o "$list_file"
    fi
  fi
  finish
fi

if [[ "$event" != "stop" ]]; then
  finish
fi

if [[ ! -f "$list_file" ]]; then
  finish
fi

mapfile -t files < <(grep -v '^[[:space:]]*$' "$list_file" || true)
rm -rf "$state_dir"

if [[ "${#files[@]}" -eq 0 ]]; then
  finish
fi

rel_files=()
for abs in "${files[@]}"; do
  case "$abs" in
    "$root_real"/*)
      rel_files+=("${abs#"$root_real"/}")
      ;;
    *)
      rel_files+=("$abs")
      ;;
  esac
done

container=""
workdir="/app"

if command -v docker >/dev/null 2>&1; then
  while IFS= read -r name; do
    [[ "$name" == fraudebot-frontend-* ]] || continue
    while IFS=$'\t' read -r source destination; do
      [[ -n "$source" && -n "$destination" ]] || continue
      source_real="$(realpath -m "$source")"
      if [[ "$source_real" == "$root_real" ]]; then
        container="$name"
        workdir="$destination"
        break 2
      fi
    done < <(docker inspect --format '{{range .Mounts}}{{.Source}}{{"\t"}}{{.Destination}}{{"\n"}}{{end}}' "$name" 2>/dev/null || true)
  done < <(docker ps --format '{{.Names}}')
fi

lint_ok=0
if [[ -n "$container" ]]; then
  echo "ESLint hook: docker exec -w ${workdir} ${container} npm run lint -- --max-warnings 0 (${#rel_files[@]} files)" >&2
  if docker exec -w "$workdir" "$container" npm run lint -- --max-warnings 0 "${rel_files[@]}" >&2; then
    lint_ok=1
  fi
else
  echo "ESLint hook: npm run lint -- --max-warnings 0 (${#rel_files[@]} files)" >&2
  if (cd "$root" && npm run lint -- --max-warnings 0 "${rel_files[@]}") >&2; then
    lint_ok=1
  fi
fi

if [[ "$lint_ok" != "1" && "${loop_count:-0}" -lt 1 ]]; then
  printf '%s\n' '{"followup_message":"ESLint reported issues on agent-edited files. Fix them, then run the execute-tests subagent or npm run quality before opening a PR."}'
  exit 0
fi

finish
