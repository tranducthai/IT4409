# Frontend Runbook

## Scope

Runbook for daily FE development, mock/real switching, and common troubleshooting.

## Prerequisites

- Node.js >= 20
- npm >= 10

Check:

```bash
node -v
npm -v
```

## Setup

From project root:

```bash
cd frontend
npm install
cp .env.example .env
```

## Environment matrix

### UI-only mode (mock)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=true
VITE_MOCK_SESSION_ROLE=STUDENT
```

Use this when backend is unavailable.

### Integration mode (real API)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
VITE_MOCK_SESSION_ROLE=STUDENT
```

Use this when backend endpoints are available.

## Run commands

### Start dev server

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Standard dev workflow

1. Pull latest branch.
2. Set `.env` mode (mock or real).
3. Run `npm run dev`.
4. Verify route guards:
   - guest cannot enter protected routes
   - logged-in user cannot reopen login/register
5. Verify dashboard by role.
6. Run lint + build before commit.

## Auth debug checklist

Files:

- `src/services/api/client.js`
- `src/services/api/auth.service.js`
- `src/services/api/session.js`
- `src/components/RouteGuards.jsx`

Check order:

1. Login returns `accessToken`, `refreshToken`, and `user`.
2. `setAuthTokens()` runs after login/register.
3. `setCurrentUser()` runs after login/register.
4. Route guard sees both token and role.
5. Logout clears both token and session.
6. Refresh flow on `401` returns new token or clears tokens.

Common failures:

- Token exists but user missing => role guard fallback loop.
- `VITE_USE_MOCK_DATA=true` while expecting real API calls.
- Backend returns different role casing (`teacher` vs `TEACHER`).

## API debug checklist

1. Confirm `VITE_API_BASE_URL` points to running backend.
2. Confirm backend route prefix is `/api`.
3. Confirm request payload field names:
   - `full_name`
   - `join_code`
   - `class_id`
   - `user_id`
4. Confirm backend response includes required fields for UI mapping:
   - `id`, `name`, `join_code`, `type`, `avatar_url`
5. Watch browser network tab for `401`, `403`, `404`, `422`, `500`.

## Dashboard debug checklist

File: `src/pages/Dashboard.jsx`

Student mode:

- Should call `GET /class-members/me/student-classes` in real mode.

Teacher mode:

- Should call `GET /class-members/me/teacher-classes`.
- Then call pending requests for each class.
- Create/update/delete/add student/approve should reload list.

Common failures:

- Invalid enum (`OPEN/CLOSED` vs backend type).
- `teacher_id` rejected by backend create class endpoint.
- Pending request response missing expected fields.

## Course detail status

File: `src/pages/CourseDetail.jsx`

Current:

- mock-only view through `dataSource.js`.

Action before full integration:

- Implement course detail service.
- Add API endpoint mapping.
- Keep fallback mock only for UI review environment.

## Reset local auth state

In browser devtools console:

```js
localStorage.removeItem('it4409_access_token');
localStorage.removeItem('it4409_refresh_token');
localStorage.removeItem('it4409_current_user');
localStorage.removeItem('it4409_mock_current_user');
```

Then reload page.

## Pre-PR checklist

- [ ] No secrets committed.
- [ ] `.env` not committed.
- [ ] Lint passed.
- [ ] Build passed.
- [ ] Role routes tested for STUDENT and TEACHER.
- [ ] Login/register flow tested in selected mode.
- [ ] README/docs updated if behavior changed.