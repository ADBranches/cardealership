# Bulk Image Upload Integration Handoff

## Purpose

This document defines the tested multipart contract for Ronald's frontend queue and the integration owner.

## Endpoint and security

`POST /api/cars/:id/images/bulk`

Middleware executes in this order:

1. Bearer-token authentication.
2. Administrator authorization.
3. Multipart parsing and backend validation.
4. Controller and service processing.

## Multipart request fields

- `images`: repeated once for each binary file.
- `clientFileIds`: a JSON array string or comma-separated list.

The number of `clientFileIds` must equal the number of files. Every value must be non-empty and unique.

Request ordering is preserved. Response result index `n` belongs to request file index `n`, and `clientFileId` is the authoritative correlation key.

```bash
curl -X POST "http://localhost:5000/api/cars/CAR_ID/images/bulk" \
  -H "Authorization: Bearer TOKEN" \
  -F 'clientFileIds=["queue-001","queue-002"]' \
  -F "images=@front.jpg;type=image/jpeg" \
  -F "images=@rear.webp;type=image/webp"
```

## Validation limits

- Field name: `images`.
- Maximum files: 10.
- Maximum size per file: 5 MiB.
- MIME types: `image/jpeg`, `image/png`, and `image/webp`.
- Extensions: `.jpg`, `.jpeg`, `.png`, and `.webp`.
- Original filenames are sanitized by the backend.

## Transport progress versus backend processing

Client-measured transport progress reports bytes transmitted, such as `loaded / total`. Transport progress does not prove MIME validation, storage, database persistence, or cleanup.

Ronald must not mark a queue item complete merely because transport progress reaches 100 percent. Final queue state must come from the backend result matched by `clientFileId`.

## Complete success

HTTP `201`:

```json
{
  "success": true,
  "carId": "CAR_ID",
  "summary": { "received": 2, "uploaded": 2, "rejected": 0, "failed": 0 },
  "files": [
    {
      "clientFileId": "queue-001",
      "fileName": "front.jpg",
      "status": "uploaded",
      "mimeType": "image/jpeg",
      "size": 1024,
      "imageId": "IMAGE_1",
      "url": "/uploads/cars/...",
      "error": null
    },
    {
      "clientFileId": "queue-002",
      "fileName": "rear.webp",
      "status": "uploaded",
      "mimeType": "image/webp",
      "size": 2048,
      "imageId": "IMAGE_2",
      "url": "/uploads/cars/...",
      "error": null
    }
  ]
}
```

## Partial success

HTTP `207` preserves both successful and unsuccessful file results:

```json
{
  "success": true,
  "carId": "CAR_ID",
  "summary": { "received": 2, "uploaded": 1, "rejected": 1, "failed": 0 },
  "files": [
    { "clientFileId": "queue-001", "status": "uploaded", "error": null },
    {
      "clientFileId": "queue-002",
      "status": "rejected",
      "error": {
        "code": "UNSUPPORTED_MIME_TYPE",
        "message": "The image MIME type is not supported."
      }
    }
  ]
}
```

## HTTP outcomes

- `201`: every submitted file uploaded.
- `207`: at least one file uploaded and at least one did not.
- `422`: no file uploaded after processing.
- `400`: malformed multipart request or invalid correlation data.
- `413`: file exceeds the configured size limit.
- `401`: authentication missing or invalid.
- `403`: administrator role required.
- `404`: target vehicle not found.
- `500`: controlled server failure.

## Stable file-result fields

Every processed result contains `clientFileId`, `fileName`, `status`, `mimeType`, `size`, `imageId`, `url`, and `error`.

Final statuses are `uploaded`, `rejected`, and `failed`. One unsuccessful file never erases successful sibling results. Persistence failure invokes storage cleanup where possible.

## Environment names

- `BULK_IMAGE_UPLOAD_FIELD_NAME`
- `BULK_IMAGE_UPLOAD_MAX_FILES`
- `BULK_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES`
- `BULK_IMAGE_UPLOAD_ALLOWED_MIME_TYPES`
- `BULK_IMAGE_UPLOAD_ALLOWED_EXTENSIONS`
- `JWT_SECRET`
- `MONGO_URI`

## Replacement seams

Replace `createLocalImageStorage()` with an adapter implementing `store(file)` and `remove(storageKey)`. Replace persistence through the existing `findById` and `save` repository methods. The service, controller, route, response contract, and frontend correlation logic remain unchanged.

## Known limitations and follow-up

- Local filesystem storage is development-only and is not suitable for horizontally scaled production.
- File content signatures are not inspected beyond MIME type and extension.
- Malware scanning, image transformation, CDN delivery, retention, and orphan reconciliation remain future work.
- Ronald must retain each queue entry until one backend result with the matching `clientFileId` is received.
