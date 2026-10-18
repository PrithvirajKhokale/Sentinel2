# Sentinel2

Infrastructure monitoring with traceable monthly observations and evidence-backed reported-change signals.

The working branch is **`mai`** (the repository default). `main` is an older baseline; branch from `mai` and submit pull requests back to `mai`. Do not rename branches or change deployment tracking without coordinating the repository and host settings.

## Implemented

- Hash-verified PDF acquisition and validated extraction for April–August 2026.
- 9,321 monthly snapshots, 2,111 project codes and 7,202 adjacent comparisons.
- PostgreSQL immutable dataset revisions, Alembic migrations and transactional import.
- FastAPI project list/detail/history, portfolio summaries, exact filter options and reported risk signals.
- React + Vite Project Explorer, Portfolio Comparisons, Evidence & Gaps, Risk Intelligence, project inspection and dark mode.
- Same-origin Docker deployment and a Render Blueprint.

Risk Intelligence describes reported progress decreases, spending with unchanged reported progress, and postponed revised target months. **It does not predict delays or cost overruns.** No trained model, probability, SHAP explanation or validated predictive accuracy is supplied.

## Start here

1. [Current team handover](docs/team-handover.md)
2. [Local database setup](docs/backend-local.md)
3. [Application setup and deployment](docs/frontend-integration.md)
4. [Tests and required checks](docs/testing.md)
5. [Operations, backups and release checklist](docs/operations.md)
6. [Data limitations](docs/monthly-project-history.md) and [API contract](docs/api_contract.md)

Use Python 3.12 and Node 22. Install Python dependencies from `requirements-backend.lock` and frontend dependencies with `npm ci`. `.env.example` is a template; the Python commands read process environment variables and do not automatically load `.env`.

The current application is **public and read-only**, with no login or bearer token. Database credentials stay server-side. The Blueprint describes infrastructure; its presence does not prove that a particular deployment is live or healthy.

The reviewed PDF archive currently lives in the original `PrithvirajKhokale/Sentinel` repository's `source-reports-2026-v1` release. Acquisition verifies both the archive and each PDF against pinned hashes. See the integration guide for this explicit build dependency.

## Quality gates

CI covers pushes to `mai`, `main` and development branches, all pull requests, and manual runs. It runs frontend contracts, reference/live-build browser smoke checks, Python syntax, full native PostgreSQL regression tests, migration drift checks and the real JavaScript API client. The complete backend gate fails if a database test is skipped.

`/healthz` is process liveness. `/readyz` checks database access, an active revision and observed coverage for its report months. Detailed import integrity remains enforced by the importer, not rehashed on every health probe.
