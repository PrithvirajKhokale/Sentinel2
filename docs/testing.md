# Regression testing

Use Python 3.12, Node 22 and a disposable PostgreSQL 17 instance. Install `requirements-backend.lock` and run `npm ci` in `frontend`. Recover/rebuild the complete dataset before database tests.

## Fast checks

```sh
python -m unittest discover -s tests -v
python -m compileall -q backend tests scripts
npm test --prefix frontend
npm run build --prefix frontend
node frontend/tests/risk-browser-smoke.mjs
```

Without `BACKEND_TEST_DATABASE_URL`, unittest skips the PostgreSQL suites. Never report that as a full backend pass. Browser smoke uses an isolated mocked API, not production.

## Complete backend gate

Set `BACKEND_TEST_DATABASE_URL` to a loopback `postgresql+psycopg://...` URL, then run:

```sh
python scripts/check_backend.py
```

The runner discovers every test module and fails on any failure **or skip**. Database tests use uniquely named schemas and remove only those schemas. Do not use production database credentials. Coverage includes extraction, source verification, immutable import/rollback, history gaps, portfolio scope, signals, readiness, startup idempotence and migration/model consistency.

For a local database dedicated to manual application checks, also run Alembic upgrade, import and `python -m alembic check`. Set `SENTINEL_TEST_API_BASE=http://127.0.0.1:8000/api/v1` and run `node frontend/tests/live-api.mjs` against the running imported API.

## Browser checks

The smoke covers both reference builds and same-origin live builds, public connection, revision-pinned searches, source evidence, history drilldown, recovery from invalid history ranges, theme switching, report switching, selectable and manually entered identity filters. For a build created with `VITE_API_BASE_URL=/api/v1`, set `SENTINEL_TEST_LIVE_BUILD=1` when running the smoke. `CHROMIUM_EXECUTABLE_PATH` may point to an installed compatible Chromium; otherwise the bundled Chromium package is used.

Browser smoke is a regression subset. Release acceptance must also exercise the real deployed API, multi-page results, all four identity filter types, loading/empty/network-error states and mobile layout. No mocked check proves source completeness or production connectivity.

## CI

The monitoring workflow runs on `mai`, `main`, `fix/**`, `feat/**`, `test/**`, all PRs and manual dispatch. It uses read-only permissions, cancels obsolete runs, applies job timeouts, and runs both browser build modes plus the complete native PostgreSQL gate and real JavaScript API client. Relevant failures must block release. Configure repository rules to require these jobs; a workflow file alone does not enforce branch protection.

The release owner should record the tested commit, suite results, skipped/blocked checks and deployment acceptance in the PR. Historical passing results in older documents do not certify a newer commit.
