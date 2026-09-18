# Sprint 9 Dependency Register

## Runtime dependencies

- Express: API routing and middleware execution.
- Multer 2.2.0: multipart parsing and file limits.
- Mongoose: exchange-rate, user, vehicle, and image metadata persistence.
- jsonwebtoken: bearer-token verification and role claims.
- dotenv: local environment loading.
- Node.js native timers: exchange-rate worker scheduling.
- Node.js filesystem and crypto modules: local image storage and safe unique keys.

## Internal replacement boundaries

- Exchange-rate provider: `fetchRates(baseCurrency)`.
- Exchange-rate repository: fresh-cache lookup, latest-snapshot lookup, and persistence.
- Image storage: `store(file)` and `remove(storageKey)`.
- Vehicle repository: `findById(vehicleId)`.
- Vehicle-image repository: `save(metadata)`.

## Environment names

### Runtime

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`

### Exchange rates

- `EXCHANGE_RATE_PROVIDER`
- `EXCHANGE_RATE_BASE_CURRENCY`
- `EXCHANGE_RATE_SUPPORTED_CURRENCIES`
- `EXCHANGE_RATE_REFRESH_INTERVAL_MS`
- `EXCHANGE_RATE_REQUEST_TIMEOUT_MS`
- `EXCHANGE_RATE_CACHE_TTL_MS`
- `EXCHANGE_RATE_MOCK_SCENARIO`

### Bulk uploads

- `BULK_IMAGE_UPLOAD_FIELD_NAME`
- `BULK_IMAGE_UPLOAD_MAX_FILES`
- `BULK_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES`
- `BULK_IMAGE_UPLOAD_ALLOWED_MIME_TYPES`
- `BULK_IMAGE_UPLOAD_ALLOWED_EXTENSIONS`

No environment values are recorded in this document.

## Ownership and follow-up

- Frontend owner: transport progress, queue state, `clientFileId` generation, and response mapping.
- FX integration owner: production provider, credentials, licensing, retries, and monitoring.
- Storage integration owner: object storage, deletion behavior, CDN URLs, and reconciliation.
- Backend owner: contracts, normalization, security, repositories, worker lifecycle, and regression tests.

## Known risks

- The current FX provider is mock-only.
- Local filesystem storage is a single-host development implementation.
- Database availability is required for persisted snapshots and vehicle-image records.
- Existing Mongoose tests emit a non-failing `validateSync` deprecation warning.
