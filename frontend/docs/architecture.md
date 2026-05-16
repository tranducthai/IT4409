# Frontend Architecture

## Overview

Frontend is React + Vite SPA for LMS platform.

Main goals:

- Support guest, student, teacher, admin flows.
- Allow UI development with mock data.
- Switch to real backend API through env config.
- Keep page components separated from API/client logic.

## Tech stack

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- lucide-react
- ESLint

## Directory map

```txt
frontend/src
├── components/          # shared UI and route guards
├── context/             # theme provider/context
├── data/                # static legacy data
├── mocks/               # mock auth/classes/courses data
├── pages/               # route-level screens
│   └── dashboard/       # dashboard sub-pages by role
└── services/
    ├── api/             # API client and domain services
    └── dataSource.js    # mock data facade for UI screens
```

## Runtime modes

Frontend has 2 modes controlled by `VITE_USE_MOCK_DATA`.

### Mock mode

```env
VITE_USE_MOCK_DATA=true
```

Behavior:

- `login()` and `register()` return mock token/user.
- Dashboard uses mock data from `src/mocks`.
- Course detail uses mock-only data.
- Backend is not required.

Use for:

- UI development.
- Layout review.
- Role-based flow testing before backend endpoint is ready.

### Real API mode

```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:3000/api
```

Behavior:

- Auth calls backend endpoints.
- Dashboard class data calls backend endpoints.
- Course detail still needs real API integration.

Use for:

- Backend integration test.
- Contract validation.
- Pre-PR QA.

## Routing

Routes are defined in `src/App.jsx`.

| Route | Access | Component |
| --- | --- | --- |
| `/` | public | `Home` |
| `/login` | guest only | `Login` |
| `/register` | guest only | `Register` |
| `/dashboard` | authenticated | `DashboardRoute` |
| `/dashboard/student` | student/admin | `Dashboard` |
| `/dashboard/teacher` | teacher | `Dashboard` |
| `/courses/:courseId` | authenticated | `CourseDetail` |

## Route guards

File: `src/components/RouteGuards.jsx`

Guards:

- `RequireAuth`: requires access token.
- `RequireGuest`: redirects authenticated user to dashboard.
- `RequireRole`: requires current user role.
- `DashboardRoute`: redirects by role.

Current limitation:

- Auth check only validates local access token existence.
- Role check depends on locally stored current user.
- If token exists but session user is missing, role routing may fail or fallback incorrectly.

Recommended improvement:

- Add `/auth/me` hydration when real mode is enabled.
- Treat token and user session as single auth state.
- Clear token and user together on logout/refresh failure.

## Auth/session flow

Files:

- `src/services/api/client.js`
- `src/services/api/auth.service.js`
- `src/services/api/session.js`
- `src/mocks/auth/mockSession.js`

Current flow:

1. User submits login/register form.
2. `auth.service.js` returns `{ accessToken, refreshToken, user }`.
3. Page stores tokens through `setAuthTokens`.
4. Page stores user through `setCurrentUser`.
5. Route guard reads token and user from local storage/mock session.

Important risk:

- Token and user are stored separately.
- Mock and real modes use different storage keys.
- Logout must clear both token and session.

## API client

File: `src/services/api/client.js`

Responsibilities:

- Resolve `API_BASE_URL`.
- Store/read/clear auth tokens.
- Attach `Authorization: Bearer <token>`.
- Refresh token once on `401`.
- Throw `ApiError` with status and payload.

Current limitation:

- Token refresh has no request queue.
- Multiple concurrent 401 responses can trigger multiple refresh calls.
- Tokens are stored in `localStorage`, which is less secure than httpOnly cookie.

## Data flow by page

### Login/Register

Files:

- `src/pages/login.jsx`
- `src/pages/register.jsx`

Flow:

- Calls `auth.service.js`.
- Stores returned token and user.
- Navigates to `/dashboard`.

### Dashboard

File: `src/pages/Dashboard.jsx`

Flow:

- Reads current user from session.
- If mock mode: reads `dataSource.js`.
- If real mode and role is `STUDENT`: calls `getStudentClasses`.
- If real mode and role is `TEACHER`: calls `getTeacherClasses` and pending requests.
- Renders `StudentDashboard` or `TeacherDashboard`.

### Course detail

File: `src/pages/CourseDetail.jsx`

Current state:

- Mock-only through `getCourseDetailData`.
- No backend service yet.

Needed integration:

- Fetch class metadata.
- Fetch sections.
- Fetch lessons.
- Fetch lesson contents/resources.
- Fetch discussion/progress data when endpoints exist.

## Known architecture risks

1. Mock mode defaults to enabled.
2. Auth token and user session can desync.
3. Role guard depends on current user in local storage.
4. Course detail is still mock-only.
5. Dashboard has mixed mock/real branching.
6. Teacher forms are tightly coupled to backend field names.
7. API contract is not enforced by TypeScript or schema validation.

## Recommended next improvements

1. Create central `authStore` or React context for token + user.
2. Add real `/auth/me` hydration.
3. Make `VITE_USE_MOCK_DATA=false` explicit in integration docs.
4. Add API contract docs for every service call.
5. Add loading/error states for route-level auth hydration.
6. Add tests for route guards and auth flows.