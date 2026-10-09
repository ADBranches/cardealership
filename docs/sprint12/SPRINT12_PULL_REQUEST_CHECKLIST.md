# Sprint 12 Pull Request Checklist

## Scope

- [x] Registration and login validation are consistent and accessible.
- [x] Passwords are validated and hashed on the backend.
- [x] Authentication errors avoid account and secret disclosure.
- [x] Email verification works end to end.
- [x] Password recovery and reset work end to end.
- [x] Recovery and verification tokens are hashed, expiring, and single-use.
- [x] Password reset and password change revoke prior sessions.
- [x] Protected and administrator routes reject invalid authorization.
- [x] Duplicate authentication flows and legacy storage checks are reconciled.
- [x] Tracked hard-coded bearer tokens are removed.

## Validation

- [x] Frontend targeted suites pass.
- [x] Live database-backed endpoint suite passes.
- [x] Authentication regressions pass.
- [x] Accessibility checks pass.
- [x] Frontend production build passes.
- [x] Backend syntax build passes.
- [x] Tracked-secret scan passes.
- [x] Working tree is clean after the final commit.
- [x] Final commit is verified on the remote branch.

## Integration and review

- [x] Parent repository fetched and inspected.
- [x] Incoming scope documented before any integration decision.
- [x] Incompatible upstream authentication rewrite rejected.
- [x] No direct merge to `main` performed.
- [x] Pull request targets the parent integration repository's `main` branch.
- [ ] Integration lead review completed.
- [ ] Integration lead merge completed.
