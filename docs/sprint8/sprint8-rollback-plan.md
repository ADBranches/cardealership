# Sprint 8 Rollback Plan

## Rollback triggers

- Administrator authentication or protected routing fails.
- Listing publication creates duplicate or incomplete records.
- Ordered image uploads lose ordering or cannot recover from partial failure.
- Dispatch mutations permit unsupported transitions or fail to preserve server authority.
- Stale responses overwrite newer booking state.
- Production mock behavior becomes enabled.
- Sensitive values appear in compiled assets or logs.

## Application rollback

1. Stop the affected deployment without altering repository history.
2. Redeploy the last approved frontend and backend commits.
3. Restore the previous environment configuration from the protected deployment system.
4. Clear only generated deployment artifacts, not customer or booking records.
5. Verify administrator authentication, inventory listing, booking reads, and health endpoints.
6. Record the incident, affected commit, deployment time, and owner without private customer data.

## Git rollback guidance

Use a reviewed revert commit for an already shared change. Do not force-push, rewrite history, rebase the shared branch, resolve conflicts speculatively, or merge without repository-administrator approval.

## Data safety

- Do not delete vehicle or booking records as a rollback shortcut.
- Reconcile partially uploaded media using the existing cleanup workflow.
- Preserve authoritative booking state from the backend.
- Use synthetic records for post-rollback verification.

## Verification after rollback

Run targeted authentication, listing, dispatch, security, and production-build checks. Confirm the branch and deployment commit match the approved rollback target before reopening traffic.
