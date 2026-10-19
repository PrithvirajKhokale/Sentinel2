# Operations and release checklist

## Release

1. Work from `mai`, review a PR against `mai`, and require all monitoring jobs. Configure required checks and branch protection in repository settings; this document does not apply those settings.
2. Confirm a recoverable backup before schema changes. Migration 0003 adds query indexes only and preserves immutable records. Larger future datasets may require an online/concurrent index plan; do not assume this small-dataset migration is lock-free.
3. Confirm the host tracks the intended repository/branch/commit. Applying the Blueprint changes infrastructure settings; check its diff separately. The public read-only audience remains unchanged.
4. Build using the pinned source archive and locked dependencies. Do not bypass source validation if the release asset is unavailable.
5. Verify `/healthz` (process) and `/readyz` (database and active report coverage). Readiness is not a full audit or a latency guarantee.
6. Verify a live August list has 1,731 observations, history for 611752 retains its June gap, and July project 400298 reports progress 55.02 to 2 with review warnings.
7. Test all four pages, project search/code, selectable/manual identity filters, pagination, history, light/dark mode, mobile layout and network-error recovery against the actual deployed API.
8. Record the commit, active dataset revision and evidence. If a check is blocked, say so; do not mark it passed.

## Backup and restore

The database and source archive are separate assets. Keep encrypted, access-controlled PostgreSQL backups outside the service filesystem, and preserve the exact PDF archive, code revision, manifest and migration history. A container filesystem is not a durable backup.

Use the hosting provider's supported backup/export mechanism or `pg_dump --format=custom` with a matching PostgreSQL client. Supply credentials through a protected connection/service configuration, never committed files or shared logs. Establish retention and a recurring backup schedule appropriate to the hosting plan.

Restore a backup with `pg_restore` into a **new isolated database**, not over the active one. Verify migration state, active revision, snapshot/comparison counts, readiness and the live-client checks before considering the restore usable. Record the restore date and tested revision. No backup/restore is claimed until this exercise succeeds.

## Recovery

- API alive but not ready: inspect database connectivity/TLS, migrations, active revision and report coverage. `/readyz` returns a sanitized 503 instead of claiming success.
- Source download fails: recover the exact verified archive from the backup/release; do not change checksums to accept arbitrary bytes.
- Failed deployment: return traffic to the last known-good application image using the host's rollback controls. Preserve data and inspect migration compatibility; do not blindly downgrade the database.
- Bad new revision: retain the prior immutable revision and use a reviewed activation operation. Never delete or overwrite snapshots to repair an import.

Startup currently activates the image's baked revision when it differs from the active pointer. Consequently, application rollback can also reactivate the older baked dataset. Review that behavior explicitly when introducing multiple production revisions.

## Current limits

No trained predictive model or notification service exists. The public API has bounded pagination/filter inputs and database connection waits, but no load-tested throughput target or gateway rate limiting. Establish load measurements and request limits before significantly increasing public traffic. The five-month UI/report catalog is intentionally bounded to the reviewed dataset. Resource retention, backups, external database access and enforced branch rules must be verified in the actual provider/account settings.

The `container-release` CI job rehearses custom-format backup/restore in an isolated database using server-matched PostgreSQL tools, checks restored counts before application startup, and reruns API checks. Keep the actual production backup schedule and restore record separately; a passing CI rehearsal is not a production backup.
