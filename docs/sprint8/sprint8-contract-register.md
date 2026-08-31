# Sprint 8 Contract Register

## Review scope

This register records verified contracts and unresolved integration boundaries for the administrator car-listing wizard and test-drive dispatch grid.

## Car creation

- Status: PARTIAL.
- Confirmed route: `POST /api/cars`.
- Access: authenticated administrator only.
- Validation: `validateCarPayload`.
- Success status: HTTP 201.
- Success response includes `success`, `message`, and `car.id`.
- Existing frontend fields: `make`, `model`, `price`, `year`, `mileage`, and one `imageFile`.
- Existing backend fields: `name`, `brand`, `type`, `category`, `year`, `price`, `power`, `engine`, `drive`, and image URL strings.
- The frontend-to-backend field mapping is not confirmed.
- VIN, color, publication state, and complete specification requirements are not represented consistently.

## Image upload

- Status: PARTIAL.
- Confirmed route: `POST /api/cars/upload`.
- Access: authenticated administrator only.
- Encoding: `multipart/form-data`.
- File field: `image`.
- Required body field: `carId`.
- Optional body field: `imageType`.
- A car record must exist before upload.
- Current middleware accepts one file through `upload.single("image")`.
- Accepted backend MIME types: JPEG, PNG, WebP, HEIC, and HEIF.
- Backend maximum size: 15 MB per image.
- Frontend maximum size: 5 MB.
- Frontend currently accepts any `image/*` value.
- Supported image categories: `primary`, `general`, `front`, `rear`, `interior`, and `engine`.
- Images are optimized, converted to WebP, uploaded to Cloudinary, and persisted.
- Database failure triggers attempted Cloudinary cleanup.
- Batch count, batch field, ordering, partial-failure, and interrupted-upload contracts are unavailable.
- The inspected `uploadController.js` contains conflicting duplicate `createCarImage` imports and is not an authoritative integration boundary until corrected.

## Administrator booking list

- Status: PARTIAL.
- Confirmed route: `GET /api/admin/bookings`.
- Access: authenticated administrator only.
- The inspected route returns `success`, `data`, and `total`.
- A separate PostgreSQL controller returns a raw array with joined customer and vehicle fields.
- Storage implementation and response shape are inconsistent.
- Pagination, filtering, sorting, and synchronization behavior are not confirmed.

## Booking status updates

- Status: BLOCKED.
- Confirmed values include `pending`, `confirmed`, and `cancelled`.
- `cancelled` is the current authoritative spelling.
- `completed` is not confirmed as a persisted status or legal transition.
- The existing update controller accepts arbitrary status text.
- No allowed-transition graph is enforced.
- A mounted protected administrator status-update route was not confirmed.
- Idempotency, stale-update, conflict, versioning, and audit behavior are not confirmed.

## Administrator security

- Car creation and image upload require authentication and administrator authorization.
- Administrator booking listing requires authentication and an administrator role.
- Device-session listing, remote revocation, TOTP setup, MFA verification, recovery codes, and pricing-operation MFA challenges were not found.

## Shared vehicle domain

- Status: PARTIAL.
- Existing frontend inventory fields include make, model, year, price, mileage, status, condition, image, and optional specifications.
- Existing backend fields include name, brand, type, category, year, price, power, engine, drive, and image URLs.
- One shared mapping for listing, comparison, filtering, and publication is not confirmed.

## Prohibited assumptions

- Do not guess a batch-upload route or field name.
- Do not guess image-ordering fields.
- Do not guess a booking-status mutation route.
- Do not enable `completed` until backend support is confirmed.
- Do not add successful MFA behavior before the backend challenge contract exists.
- Do not submit the current frontend payload directly without an approved field mapping.
- Do not represent isolated mock validation as live integration.
