#!/usr/bin/env bash
# Build Dockerfile.e2e and run the Playwright suite inside that image.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

image="${E2E_IMAGE:-frontend-e2e}"

mkdir -p playwright-report test-results

docker build -f Dockerfile.e2e -t "$image" .

status=0
docker run --rm \
  --ipc=host \
  -e CI=true \
  -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
  -v "$root/playwright-report:/app/playwright-report" \
  -v "$root/test-results:/app/test-results" \
  "$image" || status=$?

if [ "$(id -u)" -ne 0 ]; then
  docker run --rm \
    --entrypoint chown \
    -v "$root/playwright-report:/app/playwright-report" \
    -v "$root/test-results:/app/test-results" \
    "$image" \
    -R "$(id -u):$(id -g)" /app/playwright-report /app/test-results
fi

exit "$status"
