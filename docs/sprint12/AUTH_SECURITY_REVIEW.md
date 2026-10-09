# Authentication Security Review

- `src/app/App.tsx` is the only routed authentication flow.
- Canonical Login and Register pages remain under their page directories.
- Top-level page files are compatibility exports only.
- Protected and administrator guards remain intact.
- The tracked hard-coded JWT was removed.
- Local token generation requires development mode, environment input, no fallback secret, and a 15-minute expiry.
- Environment files, logs, coverage, reports, PDFs, token text, and evidence files are ignored.
