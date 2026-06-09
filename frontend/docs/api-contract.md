# Frontend API Contract

## Purpose

This document tracks current frontend service calls and expected backend contracts.

Use it when switching from mock mode to real API mode.

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

All paths below are relative to `VITE_API_BASE_URL`.

## Auth service

File: `src/services/api/auth.service.js`

### Login

```http
POST /auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "student1@example.com",
  "password": "password"
}
```

Expected response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "full_name": "Nguyen Van A",
    "email": "student1@example.com",
    "role": "STUDENT",
    "avatar_url": null
  }
}
```

Frontend usage:

- Stores `accessToken` and `refreshToken`.
- Stores `user`.
- Redirects to `/dashboard`.

### Register

```http
POST /auth/register
Content-Type: application/json
```

Current frontend request:

```json
{
  "full_name": "Nguyen Van A",
  "email": "student1@example.com",
  "password": "password",
  "role": "STUDENT"
}
```

Expected response: same shape as login.

Important contract note:

- Mock helper accepts `payload.name`, but register page sends `full_name`.
- Real API should confirm whether field is `name`, `full_name`, or both.
- Frontend should normalize this before integration freeze.

### Refresh token

```http
POST /auth/refresh
Content-Type: application/json
```

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Expected response:

```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

Frontend behavior:

- `apiRequest()` retries one time on `401`.
- If refresh fails, tokens are cleared.

Recommended contract:

- Return `refreshToken` if rotation is enabled.
- If no rotation, frontend keeps old refresh token.

### Current user

Planned endpoint:

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

Expected response:

```json
{
  "id": "uuid",
  "full_name": "Nguyen Van A",
  "email": "student1@example.com",
  "role": "STUDENT",
  "avatar_url": null
}
```

Needed because:

- Route guards currently depend on stored user.
- Refresh token updates only token, not user session.
- Reload with missing user but valid token can break role routing.

## Classes service

File: `src/services/api/classes.service.js`

### Student classes

```http
GET /class-members/me/student-classes
Authorization: Bearer <accessToken>
```

Expected response:

```json
[
  {
    "id": "class-uuid",
    "name": "Xay dung chuong trinh dich",
    "description": "Mon hoc ve compiler pipeline",
    "avatar_url": null,
    "type": "OPEN",
    "teacher_id": "teacher-uuid",
    "join_code": "IT3323-ABC",
    "is_active": true,
    "created_at": "2026-04-20T03:00:00.000Z"
  }
]
```

Frontend maps to:

```js
{
  id: cls.id,
  title: cls.name,
  code: cls.join_code,
  category: cls.type ?? 'Course',
  image: cls.avatar_url ?? 'https://via.placeholder.com/400x225',
}
```

### Teacher classes

```http
GET /class-members/me/teacher-classes
Authorization: Bearer <accessToken>
```

Expected response: same class object array as student classes.

Frontend maps to:

```js
{
  id: cls.id,
  title: cls.name,
  code: cls.join_code,
  type: cls.type,
  image: cls.avatar_url ?? 'https://via.placeholder.com/400x225',
}
```

### Pending class requests

```http
GET /class-members/classes/:classId/pending
Authorization: Bearer <accessToken>
```

Expected response:

```json
[
  {
    "id": "request-uuid",
    "class_id": "class-uuid",
    "user_id": "student-uuid",
    "role": "STUDENT",
    "status": "PENDING",
    "joined_at": "2026-04-21T08:00:00.000Z"
  }
]
```

Frontend currently displays:

- request id prefix
- class id suffix
- request status

Recommended response improvement:

```json
{
  "id": "request-uuid",
  "class_id": "class-uuid",
  "user_id": "student-uuid",
  "student": {
    "id": "student-uuid",
    "full_name": "Nguyen Van A",
    "email": "student1@example.com"
  },
  "status": "PENDING"
}
```

This avoids showing raw UUIDs in UI.

### Create class

```http
POST /classes
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Current frontend request:

```json
{
  "name": "New class",
  "description": "Class description",
  "avatar_url": "",
  "type": "OPEN",
  "join_code": "ABC123",
  "is_active": true,
  "teacher_id": "teacher-uuid"
}
```

Contract risks:

- Backend may infer `teacher_id` from token instead of accepting body field.
- Empty `avatar_url` may need `null`.
- Valid `type` enum must match backend exactly.

Recommended frontend normalization:

```js
{
  ...payload,
  avatar_url: payload.avatar_url || null,
}
```

Recommended backend behavior:

- Use authenticated user as teacher.
- Ignore client-provided `teacher_id` unless admin endpoint.

### Update class

```http
PATCH /classes/:classId
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Current frontend sends partial payload:

```json
{
  "name": "Updated class name"
}
```

or:

```json
{
  "join_code": "NEWCODE"
}
```

Expected response:

```json
{
  "id": "class-uuid",
  "name": "Updated class name",
  "join_code": "NEWCODE"
}
```

### Delete class

```http
DELETE /classes/:classId
Authorization: Bearer <accessToken>
```

Expected response:

- `204 No Content`, or
- deleted class object.

Frontend accepts both because `apiRequest()` handles `204`.

### Add student to class

```http
POST /class-members
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Current frontend request:

```json
{
  "class_id": "class-uuid",
  "user_id": "student-uuid",
  "role": "STUDENT",
  "status": "ACTIVE"
}
```

Contract risks:

- Backend may expect `student_id` instead of `user_id`.
- Backend may not allow teacher to force `ACTIVE`.
- Backend may require join request flow.

Recommended:

- Define separate endpoint for teacher direct-add if allowed.
- Define clear status transition for join request approval.

### Approve join request

```http
PATCH /class-members/:requestId/approve
Authorization: Bearer <accessToken>
```

Expected response:

```json
{
  "id": "request-uuid",
  "status": "ACTIVE"
}
```

## Course detail integration plan

File: `src/pages/CourseDetail.jsx`

Current state: mock-only.

Proposed service file: `src/services/api/course-detail.service.js`

Needed endpoints:

```http
GET /classes/:classId
GET /classes/:classId/sections
GET /sections/:sectionId/lessons
GET /lessons/:lessonId/contents
GET /classes/:classId/discussions
GET /classes/:classId/progress/me
```

Recommended combined endpoint if backend wants fewer calls:

```http
GET /classes/:classId/detail
```

Expected response:

```json
{
  "course": {},
  "sections": [],
  "lessons": [],
  "resources": [],
  "discussions": [],
  "progress": {
    "completed": 0,
    "inProgress": 0,
    "todo": 0,
    "progressPercent": 0
  }
}
```

## Error response shape

Recommended standard error:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Frontend reads:

```js
data?.message ?? data?.error ?? `API request failed with status ${response.status}`
```

If backend returns `message` as array, frontend should display joined message.

## Contract checklist before integration PR

- [ ] Confirm auth response shape.
- [ ] Confirm register field: `name` vs `full_name`.
- [ ] Confirm role enum values: `STUDENT`, `TEACHER`, `ADMIN`.
- [ ] Confirm class `type` enum values.
- [ ] Confirm teacher id source: token vs request body.
- [ ] Confirm class member add/join/approve flow.
- [ ] Confirm `204 No Content` behavior on delete.
- [ ] Add `/auth/me` or equivalent user hydration.
- [ ] Add course detail real API endpoints or keep mock documented.