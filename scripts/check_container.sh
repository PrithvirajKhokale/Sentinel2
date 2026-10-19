#!/usr/bin/env bash
# Disposable CI resources only. Never pass a production database/container here.
set -euo pipefail
: "${SENTINEL_TEST_POSTGRES_CONTAINER:?Set the disposable CI PostgreSQL container ID}"
: "${SENTINEL_TEST_BACKUP_PATH:?Set a temporary backup path}"
container=sentinel-release-check
cleanup() {
  docker logs "$container" 2>/dev/null || true
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -f "$SENTINEL_TEST_BACKUP_PATH"
}
trap cleanup EXIT
start_app() {
  docker run --detach --name "$container" --network host \
    -e APP_ENV=development -e API_HOST=127.0.0.1 \
    -e DATABASE_URL="postgresql+psycopg://sentinel:sentinel_test_only@127.0.0.1:5432/$1" \
    sentinel-release-check
  for attempt in $(seq 1 90); do
    if curl --fail --silent --max-time 3 http://127.0.0.1:8000/readyz >/dev/null; then return; fi
    if [ "$(docker inspect --format '{{.State.Running}}' "$container")" != true ]; then return 1; fi
    sleep 1
  done
  return 1
}
start_app sentinel_tests
# Assert this is the real built image, serving UI and API under a non-root user.
test "$(docker exec "$container" id -u)" = 10001
curl --fail --silent http://127.0.0.1:8000/ | grep -q 'id="root"'
SENTINEL_TEST_API_BASE=http://127.0.0.1:8000/api/v1 node frontend/tests/live-api.mjs
SENTINEL_TEST_SITE_URL=http://127.0.0.1:8000 node frontend/tests/live-browser.mjs

# Use server-matched PostgreSQL tools, retain no backup artifact in the repository.
docker exec "$SENTINEL_TEST_POSTGRES_CONTAINER" pg_dump -U sentinel -d sentinel_tests -Fc > "$SENTINEL_TEST_BACKUP_PATH"
docker exec "$SENTINEL_TEST_POSTGRES_CONTAINER" createdb -U sentinel sentinel_restore
docker exec -i "$SENTINEL_TEST_POSTGRES_CONTAINER" pg_restore -U sentinel -d sentinel_restore --exit-on-error < "$SENTINEL_TEST_BACKUP_PATH"
# Verify restored contents BEFORE startup can import anything.
test "$(docker exec "$SENTINEL_TEST_POSTGRES_CONTAINER" psql -U sentinel -d sentinel_restore -Atc 'SELECT count(*) FROM monthly_snapshots')" = 9321
test "$(docker exec "$SENTINEL_TEST_POSTGRES_CONTAINER" psql -U sentinel -d sentinel_restore -Atc 'SELECT count(*) FROM adjacent_comparisons')" = 7202
# Reuse the same image against the restored DB and run the full read contract again.
docker rm -f "$container" >/dev/null
start_app sentinel_restore
SENTINEL_TEST_API_BASE=http://127.0.0.1:8000/api/v1 node frontend/tests/live-api.mjs
printf '%s\n' 'PASS: real Docker image, browser acceptance and isolated PostgreSQL backup/restore'
