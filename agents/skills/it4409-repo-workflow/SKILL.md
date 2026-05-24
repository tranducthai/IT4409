---
name: it4409-repo-workflow
description: Repo-specific workflow for the IT4409 LMS codebase. Use when Codex is asked to analyze, modify, debug, test, document, or integrate features in this repository, especially tasks involving the NestJS backend, React/Vite frontend, auth/session flow, class/course APIs, dashboard UI, or repo handover context.
---

# IT4409 Repo Workflow

## Quick Start

Start by reading `docs/repo_context.md` unless the current turn already includes fresh repo context. For frontend-specific work, also read `docs/new-task-snapshot-frontend-fix.md` if the task touches auth, dashboard, route guards, mock mode, or class integration.

Run these checks before editing when context may have changed:

```bash
git status --short --branch
git log --oneline -8 --decorate
```

Use `rg` and targeted `sed` reads before changing files. Keep edits scoped to the user request and preserve unrelated local changes.

## Repo Shape

- Backend: `backend/`, NestJS 11, TypeORM, JWT auth, Swagger, API prefix `/api`.
- Frontend: `frontend/`, Vite 8, React 19, React Router 7, Tailwind CSS 4.
- Context docs: `docs/repo_context.md`, `docs/new-task-snapshot-frontend-fix.md`, database docs under `docs/`.
- Repo-local skill files: `agents/skills/it4409-repo-workflow/`.

## Backend Workflow

For backend tasks:

1. Read `backend/src/app.module.ts`, `backend/src/main.ts`, and the target module's `*.controller.ts`, `*.service.ts`, DTOs, entity, and repository.
2. Confirm whether the target module is imported by `AppModule`; some folders/entities exist without live app wiring.
3. Check route guards. Some generic CRUD controllers are currently unguarded.
4. Keep DTO/entity/repository/service contracts aligned.
5. Prefer focused tests when changing auth, class membership, upload, or quiz/submission behavior.

Common backend commands from `backend/`:

```bash
npm run build
npm run test
npm run test:e2e
npm run migration:show
```

Be careful with `npm run lint`; the backend lint script includes `--fix`.

## Frontend Workflow

For frontend tasks:

1. Read `frontend/src/App.jsx`, route guard files, and the specific page/component/service being changed.
2. Check mock vs real mode. Mock mode is enabled unless `VITE_USE_MOCK_DATA=false`.
3. For API work, inspect `frontend/src/services/api/client.js`, `auth.service.js`, `classes.service.js`, and `session.js`.
4. Keep dashboard flows split by role: `StudentDashboard.jsx` and `TeacherDashboard.jsx`.
5. Preserve the existing UI style unless the task asks for redesign.

Common frontend commands from `frontend/`:

```bash
npm run lint
npm run build
npm run dev -- --host 0.0.0.0 --port 5173
```

When changing UI, run lint/build and start the dev server if the user needs to try it locally.

## Integration Notes

- Backend default port in code is `3001`; frontend `.env.example` uses `http://localhost:3000/api`. Verify actual env before diagnosing API failures.
- Auth response uses `access_token`, `refresh_token`, and `user`; frontend maps both snake_case and camelCase.
- `apiRequest()` attaches bearer tokens and refreshes once on `401`.
- Course detail is mock-only in the current snapshot; dashboard class lists have real API paths.
- Teacher class creation currently sends `teacher_id` from the frontend; backend does not derive it from JWT in `ClassesService`.

## Validation

Choose validation based on blast radius:

- Frontend-only UI/service changes: `cd frontend && npm run lint && npm run build`
- Backend TypeScript/API changes: `cd backend && npm run build`, then relevant tests
- Cross-stack contract changes: run both frontend build and backend build; document any endpoint/env assumptions

If a command fails because dependencies are missing or network is blocked, report the blocker and do not mask it with unrelated changes.

## References

- Read `references/context-index.md` for the shortest map of repo context files.
- Read root `docs/repo_context.md` for the fuller current repo snapshot.
