# New Task Snapshot - Frontend Fix Handover

## Purpose

Use this file as handover context for next Cline/chat session.

Goal for next task: continue frontend-focused work from branch `fix/frontend-audit-v2`, using current audit/docs as context, then implement/fix FE issues after user assigns exact task.

## Current repo state

Repository:

```txt
/home/khanhson2005/projects/IT4409
```

Remote:

```txt
origin: git@github.com:tranducthai/IT4409.git
```

Base branch used for new fix work:

```txt
dev
```

Current active branch created for next FE fix task:

```txt
fix/frontend-audit-v2
```

Previous docs branch:

```txt
docs/frontend-audit
```

Previous docs commit:

```txt
b799549 docs(frontend): add architecture, API contract, runbook, and QA checklist
```

Note: `origin/docs/frontend-audit` exists, so previous docs branch was pushed or exists on remote.

## What happened in previous chat

User asked:

1. Analyze whole repo.
2. Sync local branch list with remote.
3. Focus on frontend errors because user owns FE.
4. Plan frontend docs.
5. Create docs branch and commit docs.
6. Create new branch for FE fixes and create this snapshot for next chat.

Completed:

- Ran `git fetch --all --prune`.
- Verified local/remote branches.
- Ran frontend lint/build.
- Audited FE architecture/auth/session/routing/API integration.
- Created docs on branch `docs/frontend-audit`.
- Committed docs-only changes.
- Switched back to `dev`.
- Created branch `fix/frontend-audit-v2`.

## Previous docs files created

On branch `docs/frontend-audit`, commit `b799549` added:

```txt
frontend/docs/architecture.md
frontend/docs/api-contract.md
frontend/docs/runbook.md
frontend/docs/qa-checklist.md
```

And updated:

```txt
frontend/README.md
```

Those docs contain useful FE context:

- frontend architecture
- routing
- auth/session flow
- mock vs real mode
- API contracts
- runbook/debug flow
- QA checklist

If branch `fix/frontend-audit-v2` does not contain those docs, compare/cherry-pick from docs branch if needed.

Recommended command if docs needed in current branch:

```bash
git cherry-pick b799549
```

Only do this if user wants docs included in FE fix branch.

## Frontend stack

Frontend path:

```txt
frontend/
```

Stack:

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- lucide-react
- ESLint

Important scripts:

```bash
cd frontend
npm run lint
npm run build
npm run dev -- --host 0.0.0.0 --port 5173
```

Last known verification on docs branch:

- `npm run lint` passed.
- `npm run build` passed.

## Key frontend files

Routing:

```txt
frontend/src/App.jsx
frontend/src/components/RouteGuards.jsx
```

Auth/API:

```txt
frontend/src/services/api/client.js
frontend/src/services/api/auth.service.js
frontend/src/services/api/session.js
frontend/src/mocks/auth/mockSession.js
```

Dashboard/API services:

```txt
frontend/src/services/api/classes.service.js
frontend/src/services/dataSource.js
frontend/src/pages/Dashboard.jsx
frontend/src/pages/dashboard/StudentDashboard.jsx
frontend/src/pages/dashboard/TeacherDashboard.jsx
```

Course detail:

```txt
frontend/src/pages/CourseDetail.jsx
```

Env:

```txt
frontend/.env.example
```

Current env example:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=true
VITE_MOCK_SESSION_ROLE=STUDENT
```

## Current routing map

From `frontend/src/App.jsx`:

| Route | Access | Component |
| --- | --- | --- |
| `/` | public | `Home` |
| `/login` | guest only | `Login` |
| `/register` | guest only | `Register` |
| `/dashboard` | authenticated | `DashboardRoute` |
| `/dashboard/student` | authenticated + role STUDENT/ADMIN | `Dashboard` |
| `/dashboard/teacher` | authenticated + role TEACHER | `Dashboard` |
| `/courses/:courseId` | authenticated | `CourseDetail` |

## Known FE issues / risks to fix later

### 1. Mock mode default can hide real API issues

Current logic:

```js
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
```

This means mock is enabled unless env explicitly says false.

Risk:

- Developer may think real backend integration is being tested while FE uses mock data.

Potential fix options:

- Keep default but document strongly.
- Add visible dev banner showing `MOCK` vs `REAL`.
- Log mode on app start in dev.
- Make real integration checklist explicit.

### 2. Token/session state can desync

Files:

```txt
client.js
session.js
mockSession.js
RouteGuards.jsx
```

Current behavior:

- Token stored in `localStorage` keys:
  - `it4409_access_token`
  - `it4409_refresh_token`
- Current user stored separately:
  - real mode: `it4409_current_user`
  - mock mode: `it4409_mock_current_user`

Risk:

- Token exists but user missing.
- User exists but token missing.
- Route guards can misroute.

Potential fix options:

- Export `clearCurrentUser` and call it from logout/refresh failure.
- Add single `clearAuthState()`.
- Add `/auth/me` hydration for real mode.
- Add guard fallback when role missing.

### 3. `auth.service.js` logout only clears mock session in mock mode

Current file imports:

```js
import { apiRequest, clearAuthTokens } from './client';
import { getMockCurrentUser, setMockCurrentUser, clearMockCurrentUser } from '../../mocks/auth/mockSession';
```

`logout()`:

```js
export function logout() {
  clearAuthTokens();
  if (USE_MOCK_DATA) {
    clearMockCurrentUser();
  }
}
```

Risk:

- In real mode, `it4409_current_user` may remain because `clearCurrentUser()` from `session.js` is not called.
- This is likely a real bug.

Recommended fix:

- Import `clearCurrentUser` from `session.js`.
- Call it unconditionally in logout.
- Or make `clearCurrentUser()` handle mode and call it instead of direct mock clear.

### 4. `api/index.js` does not export session helpers

Current:

```js
export * from './client';
export * from './auth.service';
export * from './classes.service';
```

Risk:

- Consumers import session directly from `./session`.
- Not fatal, but API barrel incomplete.

Potential fix:

```js
export * from './session';
```

### 5. Register payload mismatch risk

`register.jsx` sends:

```js
{
  full_name: fullName,
  email,
  password,
  role: role.toUpperCase(),
}
```

Mock helper in `auth.service.js` uses:

```js
full_name: payload.name ?? fallbackUser.full_name
```

Risk:

- In mock register, full name may not reflect typed `fullName`.
- Should use `payload.full_name ?? payload.name`.

Recommended fix:

```js
full_name: payload.full_name ?? payload.name ?? fallbackUser.full_name
```

### 6. Route guard role missing fallback

`RouteGuards.jsx`:

```js
const currentRole = getCurrentUser()?.role;
if (!allowedRoles.includes(currentRole)) {
  return <Navigate to={fallbackPath} replace />;
}
```

Risk:

- Authenticated token + missing user sends to fallback.
- Could loop or land in wrong dashboard.

Potential fix:

- If authenticated but no user, clear auth state and redirect `/login`.
- Or add loading/hydration later.

### 7. CourseDetail real API path hardened

`CourseDetail.jsx` now supports both mock mode and real API mode through:

```js
getCourseDetailFromApi(courseId)
```

Current behavior:

- `GET /classes/:id` is the required course detail call.
- Sections, lessons, lesson contents, quizzes, and assignments load as partial data.
- Partial endpoint failures show a Vietnamese warning banner and empty states instead of crashing the whole page.

Remaining risk:

- Quiz resource links still target the future `/courses/:courseId/quizzes/:quizId` page, which is intentionally not implemented until the quiz page feature.
- Assignment attachments may still show `0 file` until the backend class assignment query includes attachment relations.

### 8. Teacher dashboard form contract loose

`TeacherDashboard.jsx` sends raw payloads:

- create class
- update class
- add student
- approve request

Risk:

- Backend enum/field mismatch.
- `teacher_id` may be derived from token, not accepted in body.
- Empty `avatar_url` should maybe be null.

Potential fix:

- Normalize payload in `Dashboard.jsx` handlers.
- Add frontend mapping functions.

## Suggested next FE fix order

Recommended order for next chat:

1. Fix auth/session cleanup:
   - `logout()` clears both tokens and current user.
   - Refresh failure clears current user too.
   - Export session from API barrel.
2. Fix mock register full name:
   - support `full_name` in `toMockUser`.
3. Harden route guard:
   - if token exists but no user, clear auth state and redirect login.
4. Add dev visibility for mode:
   - small banner or console info: mock vs real.
5. Normalize teacher payloads:
   - `avatar_url: payload.avatar_url || null`.
   - verify `type` enum with backend.
6. Optionally implement course detail real API service if backend endpoints known.

## Commands for next chat

Check state:

```bash
git status --short --branch
git log --oneline -5
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

If needing docs from previous branch:

```bash
git cherry-pick b799549
```

## Important instruction for next agent

- User wants FE-focused fixes.
- Avoid backend changes unless required for frontend contract.
- Prefer small commits.
- Run lint/build after code changes.
- Keep docs branch separate unless user says merge/cherry-pick docs into fix branch.
- Current branch for next work should be `fix/frontend-audit-v2`.
- Do not create PR unless user asks.
