# Authentication Rollback Plan

Last known-good pre-cleanup commit: `14bd0c9adedbcc7f59ac1315d51381fa3d115351`. Revert with a new commit, rerun all authentication tests and both builds, and push for review. Phase 7 adds no schema changes. Do not drop earlier email verification, password reset, `token_version`, `password_updated_at`, failed-login columns, or token-hash indexes without backup, reviewed migration, and a maintenance window.
