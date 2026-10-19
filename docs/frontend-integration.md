# Full-data application setup

## Current architecture

Sentinel2 uses React + Vite, FastAPI and PostgreSQL. The public read-only API has no bearer-token authentication; CORS permits GET requests without credentials. `/docs` is enabled. `SENTINEL_FRONTEND_DIR` serves a built dashboard from the same origin. Do not set old `SENTINEL_API_TOKEN` or `SENTINEL_ALLOWED_ORIGINS` variables: they are not read.

Use Python 3.12, Node 22 and PostgreSQL 17 (the CI version). The repository's working/default branch is `mai`.

## Reproduce the source data

From the repository root, inside a Python virtual environment:

```sh
pip install -r requirements-backend.lock
python scripts/acquire_reports.py
python scripts/rebuild_dataset.py
```

Acquisition downloads the immutable archive from:

https://github.com/PrithvirajKhokale/Sentinel/releases/download/source-reports-2026-v1/sentinel-source-reports-2026.zip

This is an intentional dependency on the original repository's release. It must remain available for a clean Docker build. The archive SHA-256 is `a5da5970b6156935e93a20ef8a31e1aa16c5e805cbf21562ab27371c544f1680`. Archive members, PDF signatures and individual source hashes are all verified before files are written. Existing matching files work offline. Do not silently substitute other PDFs or adjust hashes. Preserve an independently backed-up copy of this exact archive; a future mirror must retain these checks.

`.gitattributes` preserves the original CRLF bytes included in the validated revision. Do not reformat extraction code, catalogs or fixtures without a deliberate new revision.

## Local application

Start PostgreSQL and set `DATABASE_URL` using [backend-local.md](backend-local.md). Then:

```sh
python -m alembic upgrade head
python -m backend.import_dataset
python -m backend.serve
```

In another terminal:

```sh
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8000`; `SENTINEL_API_PROXY_TARGET` can configure another target. API failures remain visible and never silently become sample data.

For same-origin serving, build with `VITE_API_BASE_URL=/api/v1`, set `SENTINEL_FRONTEND_DIR` to the absolute `frontend/dist` directory, and start the API. Without `VITE_API_BASE_URL`, a production frontend build starts in reference mode. The Dockerfile sets it explicitly.

## Docker and Render

The Dockerfile builds the UI, installs locked Python dependencies, recovers and validates the full dataset, and runs as a non-root user. Startup runs migrations and activates the baked revision under a PostgreSQL advisory lock before opening the API. Source PDFs and generated data are baked into the image; secrets are not.

`render.yaml` declares one free PostgreSQL database and one Docker web service. Preserve resource names when applying it to an existing stack. It proposes `/readyz` as the health path and deployment after passing CI checks. These settings take effect only when the Blueprint is synced; a PR does not change the live service.

Production environment:

- `APP_ENV=production`
- `DATABASE_URL` pointing to PostgreSQL, with TLS via `sslmode=require`, `verify-ca` or `verify-full`, or `SENTINEL_DB_SSLMODE`.
- `API_HOST=0.0.0.0`; hosting supplies `PORT`, otherwise `API_PORT` defaults to 8000.
- `SENTINEL_FRONTEND_DIR=/app/frontend/dist` (set by the image).

The provider must terminate HTTPS. Check the actual hosting plan's current retention, capacity and sleep behavior before relying on it for ongoing availability. No paid resources are provisioned by this guide.

## Verification and data boundary

Use [testing.md](testing.md) for automated checks and [operations.md](operations.md) for production acceptance and recovery. The supported dataset layout remains the reviewed April–August 2026 revision. Adding months needs a versioned catalog/manifest change and coordinated UI report choices; it is not a file-upload workflow. The Evidence page's bundled source register is explicitly reference documentation.
