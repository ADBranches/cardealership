# Sprint 9 Pull-Request Summary

## Summary

Sprint 9 adds two tested backend integrations:

1. A resilient mock-first exchange-rate service with normalization, persistence, refresh suppression, scheduled refresh, cached fallback, and stable API responses.
2. A secured bulk vehicle-image upload endpoint with multipart validation, deterministic clientFileId correlation, partial success, persistence, and orphan cleanup.

## Exchange-rate delivery

- Provides `GET /api/exchange-rates`.
- Distinguishes provider, fresh cache, stale-cache fallback, and unavailable outcomes.
- Uses deterministic mock rates that are explicitly labeled as non-production values.
- Suppresses unnecessary provider refreshes while cached snapshots remain usable.
- Prevents overlapping scheduled refreshes and leaves no open timer after shutdown.
- Preserves a provider replacement seam through `fetchRates(baseCurrency)`.

## Bulk image-upload delivery

- Provides `POST /api/cars/:id/images/bulk`.
- Enforces bearer authentication and administrator authorization.
- Enforces the `images` multipart field, file count, file size, MIME type, extension, and filename sanitization.
- Preserves one deterministic backend result for every `clientFileId`.
- Supports HTTP `201` complete success, `207` partial success, and `422` complete processing rejection.
- Returns controlled request, authorization, missing-vehicle, and server errors.
- Cleans stored objects when image metadata persistence fails.

## Validation evidence

- Targeted Sprint 9 integration tests: 24 passed, 0 failed.
- Complete backend regression tests: 70 passed, 0 failed.
- Secret scan: passed.
- Generated and accidental artifact scan: passed.
- Worker open-handle validation: passed.
- Approved Sprint 9 diff files: 57.
- Unexpected diff files: 0.

## Review focus

- Validate the production FX provider replacement plan.
- Validate the production object-storage replacement plan.
- Review administrator role provisioning and deployment secrets.
- Review database indexes and production migration requirements.
- Confirm frontend clientFileId correlation and transport-progress behavior.

## Merge policy

This feature branch must be reviewed through a pull request. The integration owner or repository administrator performs the approved merge. No direct merge into `main` is included in this phase.
