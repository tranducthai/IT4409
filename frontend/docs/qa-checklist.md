# Frontend QA Checklist

## Goal

Quick checklist for FE self-review before asking for PR review.

## Environment checks

- [ ] Correct branch checked out.
- [ ] `.env` created from `.env.example`.
- [ ] `VITE_USE_MOCK_DATA` set intentionally.
- [ ] Backend running if testing real API mode.

## Smoke checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] App opens without blank screen.
- [ ] Console has no critical runtime errors.

## Routing checks

- [ ] `/` renders Home.
- [ ] unauthenticated user opening `/dashboard` is redirected to `/login`.
- [ ] unauthenticated user opening `/courses/:courseId` is redirected to `/login`.
- [ ] authenticated user opening `/login` is redirected to `/dashboard`.
- [ ] authenticated user opening `/register` is redirected to `/dashboard`.
- [ ] `/dashboard` redirects by role:
  - [ ] `STUDENT` -> `/dashboard/student`
  - [ ] `TEACHER` -> `/dashboard/teacher`

## Login / Register checks

### Mock mode

- [ ] Login succeeds without backend.
- [ ] Register succeeds without backend.
- [ ] After login/register, token is stored.
- [ ] After login/register, user session is stored.
- [ ] Logout clears token and session.

### Real API mode

- [ ] Login hits `POST /auth/login`.
- [ ] Register hits `POST /auth/register`.
- [ ] Error state shows readable message on failed login/register.
- [ ] Refresh token flow works after `401`, or tokens are cleared safely.
- [ ] Role returned by backend matches UI expectation (`STUDENT`, `TEACHER`, `ADMIN`).

## Student dashboard checks

- [ ] Student dashboard renders course list in mock mode.
- [ ] Student dashboard renders API class list in real mode.
- [ ] Empty state renders correctly when no courses exist.
- [ ] Error state renders correctly on API failure.
- [ ] Clicking course card opens `/courses/:courseId`.

## Teacher dashboard checks

- [ ] Teacher dashboard renders class list.
- [ ] Teacher dashboard renders pending requests list.
- [ ] Create class form submits expected payload.
- [ ] Update class name works.
- [ ] Update join code works.
- [ ] Delete class works.
- [ ] Add student form submits expected payload.
- [ ] Approve request action works.
- [ ] Reload happens after each teacher action.

## Course detail checks

- [ ] Valid mock course id shows course detail.
- [ ] Invalid course id shows fallback not found state.
- [ ] Default tab is `lessons`.
- [ ] `resources` tab switches content.
- [ ] `progress` tab switches content.
- [ ] `discussions` tab switches content.

## UI checks

- [ ] Header renders correctly on all main routes.
- [ ] Footer renders correctly on all main routes.
- [ ] Dark mode styles still readable.
- [ ] Responsive layout works on mobile width.
- [ ] Buttons/links have visible hover/focus states.

## Contract checks before integration PR

- [ ] Register payload field confirmed: `full_name` vs `name`.
- [ ] Class type enum confirmed with backend.
- [ ] `teacher_id` ownership rule confirmed with backend.
- [ ] Pending request response shape confirmed.
- [ ] Delete endpoint response behavior confirmed.
- [ ] `/auth/me` or equivalent session hydration path confirmed.
- [ ] Course detail API plan documented if still not implemented.

## Regression checks after auth changes

- [ ] Clearing local storage does not crash app.
- [ ] Expired token redirects cleanly.
- [ ] Token exists but current user missing is handled safely.
- [ ] Switching `VITE_USE_MOCK_DATA` and restarting app gives expected behavior.