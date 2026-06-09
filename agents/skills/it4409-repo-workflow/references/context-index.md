# IT4409 Context Index

Use this file to choose which repo context to load.

- `docs/repo_context.md`: current high-level architecture, backend/frontend routes, scripts, risks, and validation commands.
- `docs/new-task-snapshot-frontend-fix.md`: prior frontend-focused handover, known FE issues, and suggested fix order.
- `docs/database_schema.md`: database schema reference.
- `docs/database_erd.md` and `docs/database_erd_split.md`: ERD references.
- `frontend/README.md`: frontend run/test instructions and mock mode notes.
- `backend/README.md`: NestJS starter README; use code/config over this file for project-specific backend behavior.

Task routing:

- Auth/session/route guard work: read `docs/new-task-snapshot-frontend-fix.md`, `frontend/src/services/api/*`, and `frontend/src/components/RouteGuards.jsx`.
- Dashboard/class integration: read `frontend/src/pages/Dashboard.jsx`, role dashboards, `classes.service.js`, backend `classes` and `class-members` modules.
- Course detail work: read `frontend/src/pages/CourseDetail.jsx`, `frontend/src/services/dataSource.js`, mocks, and backend sections/lessons/content modules.
- Backend endpoint work: read target controller/service/DTO/entity/repository plus `backend/src/app.module.ts`.
