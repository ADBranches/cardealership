# Auth API Contract

Base: http://localhost:5000/api/auth

## POST /register
Body: { name, email, password }
201: { success, message, user: { id, name, email, role, created_at }, token }
Errors: 400 invalid input | 409 email taken | 500 server

## POST /login
Body: { email, password }
200: { success, message, user: { id, name, email, role }, token }
Errors: 400 missing fields | 401 invalid credentials | 429 too many attempts

## GET /me
Header: Authorization: Bearer <token>
200: { success, user: { id, name, email, role } }
Errors: 401

## POST /refresh
Header: Authorization: Bearer <token>
200: { success, token }
Errors: 401

## PUT /change-password
Header: Authorization: Bearer <token>
Body: { currentPassword, newPassword }
200: { success, message }
Errors: 400 | 401

## POST /logout
Header: Authorization: Bearer <token>
200: { success, message }

## GET /users  (admin only)
Header: Authorization: Bearer <token>
200: { success, count, users: [...] }
Errors: 401 | 403

## DELETE /users/:id  (admin only)
Header: Authorization: Bearer <token>
200: { success, message }
Errors: 401 | 403 | 404

## Token format
JWT signed with JWT_SECRET, expires in 7 days.
Payload: { id, role, iat, exp }