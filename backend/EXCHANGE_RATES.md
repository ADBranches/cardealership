# Exchange-rate reference integration

The dealership's canonical prices remain in UGX. Converted values are estimates only, not payment or settlement quotations. Frankfurter v2 provides dated reference rates, not real-time market prices. See [provider documentation](https://frankfurter.dev/).

## Configuration

Production requires explicit opt-in. Set these environment variables on the backend; do not place secrets in Git. Frankfurter does not require an API key. No customer or vehicle data is sent to the provider: requests contain only base and quote currency codes.

| Variable | Default | Purpose |
| --- | --- | --- |
| `EXCHANGE_RATE_PROVIDER` | `mock` (non-production), `disabled` (production) | Set `frankfurter` to enable reference rates. Mock rates are prohibited in production. |
| `EXCHANGE_RATE_BASE_CURRENCY` | `UGX` | Default base. |
| `EXCHANGE_RATE_SUPPORTED_CURRENCIES` | `UGX,USD,EUR,GBP,KES` | Allowlist of 2–20 unique currency codes including the base. |
| `EXCHANGE_RATE_REQUEST_TIMEOUT_MS` | `5000` | HTTP deadline (maximum 30000). |
| `EXCHANGE_RATE_CACHE_TTL_MS` | `7200000` | Fresh cache lifetime (maximum 86400000). |
| `EXCHANGE_RATE_MAX_STALE_MS` | `86400000` | Additional bounded fallback lifetime (maximum 604800000). |
| `EXCHANGE_RATE_MAX_OBSERVATION_AGE_MS` | `604800000` | Absolute age limit for the oldest provider observation (maximum 604800000). |
| `EXCHANGE_RATE_RETRY_BACKOFF_MS` | `60000` | Delay after failures; HTTP 429 imposes at least 300000 ms across currencies. |
| `EXCHANGE_RATE_REFRESH_INTERVAL_MS` | `3600000` | Worker interval. |

The adapter requests a fixed HTTPS endpoint, disallows redirects, bounds response size to 64 KiB, and validates every expected quote, date and numeric rate. An additive SQLite migration adds `observed_at` without dropping existing snapshots. Reference-provider records must carry an observation date; legacy mock records cannot serve as reference data.

`observedAt` describes the oldest observation in a rate set, `retrievedAt` describes receipt by the service, and `expiresAt` describes the fresh cache lifetime. `usableUntil` is the authoritative deadline combining the configured observation-age and fresh/fallback bounds; the client must not display estimates on or after that instant. The response retains provider provenance. A fresh cache does not imply a newly published rate. A bounded fallback includes a warning; when no acceptable snapshot exists, the service returns a controlled unavailable error. Simultaneous refreshes for a base coalesce within a process. A shared multi-process deployment may need distributed refresh coordination.

## HTTP API and worker

`GET /api/exchange-rates?baseCurrency=UGX` is public and read-only; omitting the parameter uses the configured base. `HEAD` is also supported. Other methods receive 405, invalid input 400, rate-limited requests 429 with `Retry-After`, unavailable snapshots 503, and unexpected failures 500 with sanitized error messages. Responses carry `Cache-Control: no-store` so intermediary caches cannot extend the lifetime of reference data. The request guard allows 120 requests per client and 1200 total per process per minute, including invalid requests. It relies on Express's `req.ip`; do not enable unrestricted `trust proxy`. Deployments behind a trusted proxy must configure the correct proxy trust boundary and may need a shared edge rate limiter.

The refresh worker starts after the server listens, performs an initial refresh, and schedules periodic refreshes. It stops scheduling on server close. A disabled provider does not start a worker. Failed refreshes are logged without raw exception details and do not stop the HTTP server. No remote request is required to run the automated tests, which use injected HTTP responses and in-memory storage. A live smoke test and frontend integration are separate acceptance steps.

## Storefront display

The inventory and vehicle detail pages share a currency preference (UGX, USD, EUR, GBP or KES). Only the preference is persisted in browser storage; rates are not. UGX is the default and needs no exchange-rate request. The client requests UGX-base rates through the configured API adapter only when a currency selector is mounted and a foreign currency is selected. The request has an eight-second deadline, and the snapshot is revalidated no later than 60 seconds after receipt while visible. Switching back to UGX or leaving the storefront cancels pending work. Network failures, expired/malformed responses and missing quotes leave the original UGX price visible. Development mock rates are explicitly marked and rejected by production frontend builds.

Converted amounts are rounded to whole currency units, marked as estimates and shown alongside the original UGX price. The selector reports the oldest reference observation date and whether a fallback was used. The conversion is purely presentational: vehicle records, inventory filters, booking workflows, financing and admin pricing retain canonical UGX values. A manual browser smoke test should exercise each supported currency, navigation, reload, unavailable rates and the financing workflow before release.
