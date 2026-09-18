# Sprint 9 Bulk Car Image Upload API Contract

## Endpoint

`POST /api/cars/:id/images/bulk`

The endpoint accepts multipart form data for an existing car. The multipart field name is `images`.

## Mock integration boundary

Sprint 9 uses mock-compatible storage and configuration boundaries. The integration owner can replace the storage or provider adapter without changing this response contract.

## Request rules

- Maximum files: 10
- Maximum size per file: 5 MiB
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`
- Accepted extensions: `.jpg`, `.jpeg`, `.png`, `.webp`
- Every frontend queue item should include a stable `clientFileId`.

## File statuses

- `accepted`: validation passed and processing can begin.
- `uploaded`: storage and persistence completed.
- `rejected`: server-side validation rejected the file.
- `failed`: storage or persistence failed after validation.

## Stable error codes

- `CAR_NOT_FOUND`
- `FILE_REQUIRED`
- `TOO_MANY_FILES`
- `FILE_TOO_LARGE`
- `UNEXPECTED_FIELD`
- `UNSUPPORTED_MIME_TYPE`
- `UNSUPPORTED_EXTENSION`
- `STORAGE_FAILED`
- `PERSISTENCE_FAILED`

## Response contract

The response contains `carId`, summary counts, and one result for every submitted file. Result ordering remains deterministic and `clientFileId` maps the backend result to the corresponding frontend queue item.

## Progress ownership

The frontend calculates transport progress while bytes are being transmitted. The backend response reports final validation, storage, and persistence results.

## Partial success

A rejected or failed file does not erase successful file results. Summary counts report received, uploaded, rejected, and failed totals.
