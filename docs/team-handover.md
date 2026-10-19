# Sentinel2 team handover

Current implementation: historical monitoring and evidence-backed reported signals. This supersedes older handover assumptions that the frontend or deployment configuration was missing.

## Shared starting point

Repository: https://github.com/PrithvirajKhokale/Sentinel2

Use the default branch `mai`. `main` is a historical baseline. Create a feature/fix branch from current `mai`, open a PR targeting `mai`, and require the monitoring checks before merging. Preserve local changes when updating a checkout.

The application currently has public read-only access. No API token is accepted or required. Production connects to PostgreSQL using TLS and serves the React dashboard and API from one host. A branch containing configuration is not proof of a completed deployment.

## Ownership by work area

Assign named owners within the team; old role assignments and PR numbers copied from Sentinel are not current Sentinel2 assignments.

- Data: preserve reviewed source hashes, raw values, audits and revision immutability; assess identity and field comparability.
- Backend: maintain migrations, import transactions, API contracts, readiness and database operations.
- Frontend: maintain all four pages, filters, history, source warnings, accessibility and real-API integration.
- Release owner: review checks, deployment commit, backup/restore evidence and production acceptance.

## Reproduce before changing anything

Follow [local backend setup](backend-local.md) and [integration](frontend-integration.md). A clone includes fixtures and reference examples, but not the PDFs, complete generated data or a database. Recover the exact PDFs, rebuild the dataset and validate/import it. Never change pinned hashes just to make a different source pass.

Run the full [test gate](testing.md) with disposable local PostgreSQL. Without PostgreSQL, the ordinary unittest command skips database checks; that is not full verification.

## Existing product

- Project search/detail, month selection, exact identity filters and paging.
- History with raw observations, explicit gaps and adjacent comparisons.
- Portfolio summaries with scope-change versus report-absence distinctions.
- Three reported risk signals with PDF page references and review reasons.
- Dark mode, example/live modes, consistent dataset revisions and error handling.

A report absence is not completion. Zero is not missing. Reported decreases do not identify their cause. The Evidence page's bundled register is reference documentation, not a live data catalog.

## Remaining milestones

1. Verify the released commit against the actual hosted API and dashboard, including mobile layout and failure recovery.
2. Confirm durable database retention, backups and a successful isolated restore.
3. Add dedicated reporting coverage and carefully specified multi-month monitoring only after the current release passes.
4. Review field-level comparability, source inconsistencies and identity changes.
5. Define defensible ML targets, outcome labels and time-availability rules; then evaluate baselines before building prediction endpoints or explanations.

See [operations](operations.md) for the concrete release checklist. No ML completion or production acceptance is implied by this document.
