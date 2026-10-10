# Sprint 9 Bulk Car Image Upload API Contract

## Endpoint

`POST /api/cars/:id/images/bulk`

The endpoint requires a valid bearer token with the `administrator` role.

Middleware order is authentication, administrator authorization, multipart parsing and validation, then controller processing.

## Multipart fields

- `images`: repeated binary file field.
- `clientFileIds`: JSON array string or comma-separated values.

Each file must have exactly one non-empty, unique `clientFileId`. Input and result ordering are deterministic, so Ronald can map every frontend queue item to exactly one backend result.

## Limits

- Maximum files: 10.
- Maximum size per file: 5 MiB.
- MIME types: `image/jpeg`, `image/png`, and `image/webp`.
- Extensions: `.jpg`, `.jpeg`, `.png`, and `.webp`.
- Original filenames are sanitized by the backend.

## File-result schema

```json
{
  "clientFileId": "queue-001",
  "fileName": "front.jpg",
  "status": "uploaded",
  "mimeType": "image/jpeg",
  "size": 1024,
  "imageId": "IMAGE_ID",
  "url": "/uploads/cars/...",
  "error": null
}
```

Final statuses are `uploaded`, `rejected`, and `failed`. The internal `accepted` status indicates pre-processing acceptance.

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

## HTTP outcomes

- `201`: every file uploaded.
- `207`: partial success.
- `422`: no file uploaded after processing.
- `400`: malformed multipart or correlation request.
- `413`: oversized file.
- `401`: authentication missing or invalid.
- `403`: administrator role required.
- `404`: vehicle not found.
- `500`: controlled server failure.

## Progress ownership

Frontend transport progress measures bytes sent. Backend results report validation, storage, persistence, and cleanup outcomes. Transport progress reaching 100 percent does not prove upload success.

## Replacement boundary

The storage adapter may be replaced by any implementation exposing `store(file)` and `remove(storageKey)`. The service, controller, route, response schema, and frontend `clientFileId` mapping remain unchanged.

See `bulk-image-upload-integration-handoff.md` for complete request and response examples.
