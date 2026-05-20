# Repo Context - IT4409

Generated on 2026-05-20 for quick handover before new tasks.

## Current State

- Working directory: `/home/khanhson2005/projects/IT4409`
- Current branch: `fix/frontend-audit-v2`
- Worktree was clean at analysis time before Feat 2 work.
- Latest completed frontend work: Feat 2 adds a BTVN tab/card to course detail and loads assignments in real API mode.
- Existing handover doc: `docs/new-task-snapshot-frontend-fix.md`
- Frontend audit docs mentioned in that handover are not present on this branch under `frontend/docs/`.

## High-Level Architecture

This is an LMS-style project with separate backend and frontend folders.

- `backend/`: NestJS 11, TypeScript, TypeORM, JWT auth, Swagger.
- `frontend/`: Vite 8, React 19, React Router 7, Tailwind CSS 4.
- `docs/`: database schema/ERD docs plus handover/context notes.

## Backend

### Runtime and Config

- Entry point: `backend/src/main.ts`
- App module: `backend/src/app.module.ts`
- Data source for migrations/CLI: `backend/src/data-source.ts`
- Global API prefix: `/api`
- Swagger UI: `/api/docs`
- Static uploads: `/uploads`
- Default listen host/port in code: `127.0.0.1:3001`
- `.env.example` says `PORT=3000`, so verify env when running.
- CORS allows localhost/127.0.0.1 ports by default unless `CORS_ORIGIN` is set.
- DB selection:
  - If `DATABASE_URL` exists: Postgres with optional SSL (`PG_SSL`, default true).
  - Otherwise: MySQL from `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
- `synchronize: false`; schema should be handled by migrations.

### Scripts

From `backend/`:

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npm run test:e2e
npm run migration:run
npm run migration:generate
npm run migration:revert
npm run migration:show
npm run migrate:hash-passwords
```

Note: backend lint script uses `--fix`.

### Imported Modules

`AppModule` currently imports:

- `AuthModule`
- `UsersModule`
- `StudentProfilesModule`
- `InstructorProfilesModule`
- `ClassesModule`
- `ClassMembersModule`
- `SectionsModule`
- `LessonsModule`
- `WeeksModule`
- `ContentsModule`
- `ContentPagesModule`
- `QuizModule`
- `DiscussionsModule`
- `MessagesModule`
- `AssignmentsModule`
- `SubmissionsModule`

There are also module folders/entities for `answers`, `questions`, `quizzes`, `quiz-answers`, `quiz-attempts`, `notifications`, `video-sessions`, and `video-participants`. Some are entity-only or not imported into `AppModule` in the current snapshot.

### Main API Routes

All routes below are under `/api`.

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me` guarded by JWT
- `PATCH /auth/change-password` guarded by JWT

Classes:

- `POST /classes`
- `GET /classes`
- `GET /classes/:id`
- `PATCH /classes/:id`
- `DELETE /classes/:id`

Class members:

- `GET /class-members/me/teacher-classes` guarded, teacher only
- `GET /class-members/me/student-classes` guarded, student only
- `POST /class-members/me/request-join` guarded, student only
- `PATCH /class-members/:id/approve` guarded, teacher only
- `GET /class-members/classes/:classId/pending` guarded, teacher only
- Generic CRUD: `POST/GET/PATCH/DELETE /class-members`

Course content structure:

- `sections`: CRUD plus `POST /sections/bulk`, `GET /sections/class/:classId`
- `lessons`: CRUD plus `POST /lessons/bulk`, `GET /lessons/section/:sectionId`
- `lesson-contents`: CRUD plus `POST /lesson-contents/bulk`, `GET /lesson-contents/:id/open`
- `weeks`: generic CRUD
- `contents`: generic CRUD
- `content-pages`: generic CRUD

Assessments and discussion:

- `quizzes`: CRUD plus guarded create/update/delete and `GET /quizzes/class/:classId`, `GET /quizzes/:id/open`
- `quiz`: `GET /quiz/:quizId`, guarded start/submit/my-attempts/attempt detail routes
- `questions`, `answers`, `quiz-answers`, `quiz-attempts`: generic CRUD controllers exist.
- `assignments`: guarded create/update/delete with file upload; list all, class detail, detail by id.
- `submissions`: guarded submit assignment with file upload; generic CRUD exists.
- `discussions`, `messages`: generic CRUD.

### Core Entities

Primary tables/entities include:

- Users/profiles: `users`, `student_profiles`, `teacher_profiles`
- Classes/membership: `classes`, `class_members`
- Course content: `sections`, `lessons`, `lesson_contents`, `weeks`, `contents`, `content_pages`
- Quizzes: `quizzes`, `questions`, `answers`, `quiz_attempts`, `quiz_answers`
- Assignments: `assignments`, `assignment_attachments`, `assignment_submissions`, `assignment_submission_files`
- Collaboration: `discussions`, `messages`, `notifications`, `video_sessions`, `video_participants`

Several IDs are UUIDs, but `sections`, `lessons`, `lesson_contents`, and `answers` use generated integer IDs in the current entities.

### Backend Notes and Risks

- `ClassesController` generic CRUD is not guarded in the current snapshot.
- `ClassMembersController` has protected role-aware routes, but generic CRUD is not guarded.
- Teacher dashboard frontend currently sends `teacher_id` in create class payload; backend `ClassesService` accepts DTO and does not derive teacher from JWT.
- Frontend `.env.example` defaults to `http://localhost:3000/api`, while backend code defaults to port `3001` if `PORT` is not set.
- Some modules/entities exist but are not imported through `AppModule`; check imports before assuming endpoints are live.

## Frontend

### Runtime and Config

- Entry point: `frontend/src/main.jsx`
- App/router: `frontend/src/App.jsx`
- Environment sample: `frontend/.env.example`
- Mock mode default: `VITE_USE_MOCK_DATA !== 'false'`, so mock data is enabled unless explicitly disabled.
- API base default in client: `http://localhost:3000/api`

### Scripts

From `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Common dev command from README:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

### Routes

From `frontend/src/App.jsx`:

- `/`: public home
- `/login`: guest only
- `/register`: guest only
- `/dashboard`: authenticated role redirect
- `/dashboard/student`: authenticated, `STUDENT` or `ADMIN`
- `/dashboard/teacher`: authenticated, `TEACHER`
- `/courses/:courseId`: authenticated course detail

Route guards live in `frontend/src/components/RouteGuards.jsx`.

### Auth and API Flow

Important files:

- `frontend/src/services/api/client.js`
- `frontend/src/services/api/auth.service.js`
- `frontend/src/services/api/session.js`
- `frontend/src/services/api/authState.js`
- `frontend/src/mocks/auth/mockSession.js`
- `frontend/src/mocks/auth/mockUsers.js`

Local storage keys:

- `it4409_access_token`
- `it4409_refresh_token`
- `it4409_current_user`
- `it4409_mock_current_user`

`apiRequest()` adds bearer token automatically, tries refresh once on `401`, then clears auth state on refresh failure.

### Data Sources

- `frontend/src/services/dataSource.js` is mock-centric and exports `USE_MOCK_DATA`.
- `frontend/src/services/api/classes.service.js` contains real API wrappers for class/member operations.
- `Dashboard.jsx` chooses mock vs real for student/teacher class lists.
- `CourseDetail.jsx` supports mock data and real API loading through `getCourseDetailFromApi()`.
- Course detail real API loading currently uses classes, sections, lessons, all lesson contents filtered client-side, quizzes by class, and assignments by class.

### Important Frontend Files

- Layout: `components/Header.jsx`, `Footer.jsx`, `DevModeBanner.jsx`
- Cards: `CourseCard.jsx`, `DashboardCard.jsx`
- Pages: `Home.jsx`, `login.jsx`, `register.jsx`, `Dashboard.jsx`, `CourseDetail.jsx`
- Role views: `pages/dashboard/StudentDashboard.jsx`, `pages/dashboard/TeacherDashboard.jsx`
- Theme: `context/ThemeProvider.jsx`, `context/theme.js`

### Frontend Notes and Risks

- Mock mode being the default can hide backend integration problems.
- `CourseDetail.jsx` has real API loading/error handling and renders lesson resources plus a BTVN tab between `Bài học` and `Tài nguyên`.
- Course detail assignment attachments may show `0 file` in real API mode because backend `AssignmentsRepository.findManyByClassId()` does not currently include the `attachments` relation.
- `Dashboard.jsx` has real API integration for class lists and teacher actions, but uses compact mapping; verify field/enum contracts before extending.
- `TeacherDashboard.jsx` uses raw UUID inputs for adding students; usable for testing, not polished UX.
- Some Vietnamese UI text is ASCII-only/without accents in current files; preserve style unless changing copy intentionally.

## Existing Docs

- `docs/database_schema.md`
- `docs/database_erd.md`
- `docs/database_erd_split.md`
- `docs/new-task-snapshot-frontend-fix.md`
- `docs/frontend_feature_progress.md`
- `api_test.md`

`docs/new-task-snapshot-frontend-fix.md` includes previous frontend audit handover and recommended frontend fix order.

`docs/frontend_feature_progress.md` tracks the current user-requested feature list and the one-feature-at-a-time review workflow.

Current frontend feature queue lives in `docs/frontend_feature_progress.md`. It includes course lesson resources, BTVN cards, class-specific add-student UI, course detail stability, quiz creation/listing, separate quiz page routing, admin/root role, account management UI, and Vietnamese diacritics sync across the web UI.

## Useful First Checks for Future Tasks

```bash
git status --short --branch
git log --oneline -8 --decorate
```

Frontend verification:

```bash
cd frontend
npm run lint
npm run build
```

Backend verification:

```bash
cd backend
npm run build
npm run test
```

Use the frontend dev server when changing UI:

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
