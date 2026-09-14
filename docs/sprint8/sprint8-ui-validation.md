# Sprint 8 UI Validation

## Scope

The listing wizard and dispatch management board were reviewed for keyboard access, screen-reader semantics, responsive reachability, long-content handling, loading states, empty states, error recovery, mutation feedback, and reduced-motion support.

## Listing wizard scenarios

- Empty and invalid forms remain on the current step and expose validation feedback.
- Backward navigation preserves entered state.
- The image picker retains a keyboard-operable button and native file input.
- Invalid image metadata is rejected before upload.
- Partial upload recovery retains the submission checkpoint and retries failed images only.
- Submission locking prevents duplicate publication.
- Unauthorized, expired-session, and MFA outcomes remain represented by the submission coordinator.
- Mobile controls remain full-width and reachable.

## Dispatch scenarios

- Loading uses an announced busy region.
- Empty columns retain visible status headings and counts.
- API failures provide a Retry control.
- Legal transitions are derived from the approved transition map.
- Mutation controls disable while a booking update is pending.
- Cancellation requires a confirmation dialog.
- Rollback, duplicate actions, stale responses, and authoritative reconciliation are covered by domain tests.
- Desktop uses four columns, tablet uses two, and mobile uses one column plus status navigation links.
- Long customer and vehicle values wrap without obscuring actions.
- Reduced-motion preferences disable nonessential animation and transition duration.

## Validation boundary

This phase performs targeted responsive and accessibility validation. Full regression and production-release validation remain outside this approval gate.
