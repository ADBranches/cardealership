# Sprint 9 Rollback Plan

## Purpose

This plan provides reversible rollback actions for Sprint 9 after an approved pull-request merge. The implementation branch does not perform the merge.

## Preferred rollback method

Use a pull request that reverts the approved Sprint 9 merge commit. Do not force-push `main`, rewrite shared history, or delete production data as an initial rollback action.

## Application rollback

1. Identify the approved Sprint 9 merge commit.
2. Create a dedicated rollback branch from the current protected base.
3. Revert the merge commit using the repository-approved parent selection.
4. Run the complete backend regression suite.
5. Push the rollback branch and submit a rollback pull request.
6. Allow the integration owner or administrator to review and merge the rollback.

## Exchange-rate rollback

- Disable route exposure by reverting the approved route-registration commit through the rollback pull request.
- Stop the refresh worker through the reverted server lifecycle wiring.
- Retain cached snapshots unless the database owner approves deletion.
- Restore the previous frontend currency behavior if the API becomes unavailable.

## Bulk-upload rollback

- Revert the car-route registration and controller integration.
- Prevent new uploads before changing storage or database records.
- Retain existing image metadata and objects until reconciliation is complete.
- Remove orphaned development objects only after comparing storage keys with persisted metadata.

## Data safety

- Never delete vehicle, user, image, or exchange-rate records without an approved backup and reconciliation plan.
- Preserve audit evidence and deployment logs.
- Rotate credentials if rollback is caused by potential exposure.

## Verification after rollback

- Existing non-Sprint 9 routes remain operational.
- The reverted Sprint 9 endpoints are no longer exposed where expected.
- No worker timer remains active.
- No untracked upload object remains without an explicit reconciliation record.
- The rollback pull request contains only the intended revert.
