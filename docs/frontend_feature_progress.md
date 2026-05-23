# Frontend Feature Progress

Updated on 2026-05-23.

## Working Rule

Implement one feature at a time, then stop for review. Do not continue to the next feature until the user approves.

## Feature Plan

- [x] Feat 1. Course detail resource formats per lesson: text, PDF/file, video, quiz.
- [x] Feat 2. Add BTVN card in the concrete course view.
- [x] Feat 3. Move "add student" into each concrete class card.
- [x] Feat 4. Stabilize concrete course detail failures with loading/error/empty states.
- [x] Feat 5. Add teacher UI for creating quiz and load quiz list from DB.
- [x] Feat 6. Make quiz click open a separate route/page.
- [ ] Feat 7. Add ADMIN/root role permission flow.
- [x] Feat 8. Finish account management card UI.
- [x] Feat 9. Sync Vietnamese copy with proper diacritics across the whole web UI.

## Feature Plan - Vietnamese Source

- [x] Feat 1. Text, PDF, quiz: dinh dang tai nguyen cho tung bai hoc trong trang cu the khoa hoc.
- [x] Feat 2. Them the BTVN trong trang cu the khoa hoc.
- [x] Feat 3. Dua thao tac them sinh vien vao dung the/lop cu the.
- [x] Feat 4. Sua loi trang cu the khoa hoc thinh thoang bi loi.
- [x] Feat 5. Them giao dien tao quiz va lay danh sach quiz tu DB.
- [x] Feat 6. Bam vao quiz se mo page rieng, khong dung single-page tab.
- [ ] Feat 7. Tao role ADMIN/root co quyen quan tri.
- [x] Feat 8. Code tiep giao dien the quan ly tai khoan.
- [x] Feat 9. Dong bo tieng Viet co dau tren toan web.

## Recommended Remaining Priority

1. Feat 7. Add ADMIN/root role permission flow.

Rationale:

- Feat 7 should be later because ADMIN/root permission flow has broader auth, route guard, and role implications.

## Feat 8 - Account Management Card UI

Status: ready for review.

Changed files:

- `frontend/src/components/AccountManagementCard.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/services/api/auth.service.js`
- `docs/repo_context.md`
- `docs/frontend_feature_progress.md`

What changed:

- Added a shared account management card to the authenticated dashboard.
- The card displays current user name, email, role, and user ID.
- Added a password change form using the existing guarded `PATCH /auth/change-password` endpoint in real API mode.
- Mock mode returns a local success state for password changes so the UI works in default dev mode.

Validation:

- `cd frontend && npm run lint && npm run build`: passed.
- `cd frontend && VITE_USE_MOCK_DATA=false npm run build`: passed.
- `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`: started successfully with elevated local server permission; smoke requests to `/dashboard/student` and `/dashboard/teacher` returned `200 OK`.
- `cd backend && npm run build`: passed.
- `cd backend && npm run test`: passed.

Review notes:

- No ADMIN/root permission flow, user CRUD management, or profile update API was added.

## Feat 1 - Course Detail Lesson Resources

Status: reviewed and complete.

Changed files:

- `frontend/src/pages/CourseDetail.jsx`
- `frontend/src/services/api/course-detail.service.js`
- `frontend/src/services/dataSource.js`
- `frontend/src/mocks/classes/mockClasses.js`
- `frontend/src/mocks/courses/mockCourses.js`

What changed:

- Added real API loader for course detail using:
  - `GET /classes/:id`
  - `GET /sections/class/:classId`
  - `GET /lessons/section/:sectionId`
  - `GET /lesson-contents`
  - `GET /quizzes/class/:classId`
- Course detail now has loading and error states in real API mode.
- Lessons now render concrete resource cards per lesson instead of only type chips.
- Resource types are normalized and displayed as text, PDF, file, video, or quiz.
- Mock data now includes lowercase lesson content types and one quiz resource.
- Resource tab now groups lesson resources and class quizzes.

Validation:

- `cd frontend && npm run lint`: passed.
- `cd frontend && npm run build`: passed.

Review notes:

- Quiz resource links point to `/courses/:courseId/quizzes/:quizId`, but that route/page is intentionally not implemented until Feat 6.
- Backend has no `GET /lesson-contents/lesson/:lessonId`, so the frontend currently loads all lesson contents and filters client-side for the selected course.

## Feat 2 - Course Detail BTVN Card

Status: reviewed and complete.

Changed files:

- `frontend/src/pages/CourseDetail.jsx`
- `frontend/src/services/api/course-detail.service.js`
- `frontend/src/services/dataSource.js`
- `frontend/src/mocks/courses/mockCourses.js`

What changed:

- Added a BTVN summary count to the course detail header metrics.
- Added a BTVN tab/card in the concrete course detail page, placed between `Bài học` and `Tài nguyên`.
- Real API mode now loads assignments from `GET /assignments/class/:classId`.
- Assignment data is normalized with due date, status, and optional attachments.
- Mock course detail data now includes BTVN examples for existing mock classes.

Validation:

- `cd frontend && npm run lint`: passed.
- `cd frontend && npm run build`: passed.

Review notes:

- The BTVN card links attachment files when `attachments` are present.
- Backend `findManyByClassId` currently does not include attachment relations, so real API cards may show `0 file` until that backend query is expanded.

## Feat 3 - Class Card Add Student

Status: ready for review.

Changed files:

- `frontend/src/pages/dashboard/TeacherDashboard.jsx`
- `docs/repo_context.md`
- `docs/new-task-snapshot-frontend-fix.md`
- `docs/frontend_feature_progress.md`

What changed:

- Removed the standalone "Thêm sinh viên vào lớp" section from the teacher dashboard.
- Added the student user ID input and add button inside each concrete teacher class card.
- Kept the existing add-student payload contract through `Dashboard.jsx`: `{ class_id, user_id, role: 'STUDENT', status: 'ACTIVE' }`.
- Kept the current raw student user ID input behavior; no student search, account management, or backend flow was added.

Validation:

- `cd frontend && npm run lint && npm run build`: passed.
- `cd frontend && VITE_USE_MOCK_DATA=false npm run build`: passed.
- `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`: started successfully with elevated local server permission; smoke requests to `/`, `/dashboard/teacher`, and `/courses/1` returned `200 OK`.
- `cd backend && npm run build`: passed.
- `cd backend && npm run test`: passed.

Review notes:

- No quiz page, quiz creation UI, ADMIN flow, account management, or backend API change was made.

## Feat 6 - Separate Quiz Page

Status: ready for review.

Changed files:

- `frontend/src/App.jsx`
- `frontend/src/pages/QuizDetail.jsx`
- `frontend/src/services/api/quiz-detail.service.js`
- `frontend/src/services/dataSource.js`
- `frontend/src/mocks/courses/mockCourses.js`
- `docs/repo_context.md`
- `docs/new-task-snapshot-frontend-fix.md`
- `docs/frontend_feature_progress.md`

What changed:

- Added authenticated route `/courses/:courseId/quizzes/:quizId`.
- Added a dedicated quiz detail page with Vietnamese loading/error/not-found/empty-question states.
- Existing quiz resource links in course detail now open the separate route instead of falling through to an unimplemented page.
- Real API mode loads quiz data from the existing `GET /quiz/:quizId` endpoint.
- Mock mode now includes sample quiz questions so the page renders useful content by default.

Validation:

- `cd frontend && npm run lint && npm run build`: passed.
- `cd frontend && VITE_USE_MOCK_DATA=false npm run build`: passed.
- `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`: started successfully with elevated local server permission; smoke requests to `/dashboard/teacher` and `/courses/:courseId/quizzes/:quizId` returned `200 OK`.
- `cd backend && npm run build`: passed.
- `cd backend && npm run test`: passed.

Review notes:

- No quiz creation UI, submit attempt flow, ADMIN flow, account management, or backend API change was made.
- The page shows quiz details/questions only; taking/submitting a quiz remains outside this feature.

## Feat 5 - Teacher Quiz Creation And DB Quiz List

Status: ready for review.

Changed files:

- `frontend/src/pages/CourseDetail.jsx`
- `frontend/src/services/api/quizzes.service.js`
- `frontend/src/services/dataSource.js`
- `frontend/src/mocks/courses/mockCourses.js`
- `docs/repo_context.md`
- `docs/new-task-snapshot-frontend-fix.md`
- `docs/frontend_feature_progress.md`

What changed:

- Added a teacher-only quiz creation form in the course detail `Tài nguyên` tab.
- Real API mode creates quiz metadata through `POST /quizzes` and refreshes the course detail data afterward.
- Real API mode keeps loading the class quiz list from `GET /quizzes/class/:classId`.
- Mock mode persists newly created quiz metadata in mock local storage so the quiz list and separate quiz page can resolve created mock quizzes.
- Created quizzes appear in the `Quiz của lớp` resource group and link to `/courses/:courseId/quizzes/:quizId`.

Validation:

- `cd frontend && npm run lint && npm run build`: passed.
- `cd frontend && VITE_USE_MOCK_DATA=false npm run build`: passed.
- `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`: started successfully with elevated local server permission; smoke requests to `/courses/:courseId` and `/courses/:courseId/quizzes/:quizId` returned `200 OK`.
- `cd backend && npm run build`: passed.
- `cd backend && npm run test`: passed.

Review notes:

- This creates quiz metadata only: title, description, time limit, total question count, and random flag.
- Question authoring, quiz attempt start/submit, ADMIN flow, and account management remain outside this feature.

## Feat 4 - Course Detail Loading/Error/Empty States

Status: ready for review.

Changed files:

- `frontend/src/pages/CourseDetail.jsx`
- `frontend/src/services/api/course-detail.service.js`
- `docs/repo_context.md`
- `docs/new-task-snapshot-frontend-fix.md`
- `docs/frontend_feature_progress.md`

What changed:

- Kept class detail loading as the required API call; if the class itself fails, the page still shows the existing full error state with a retry action.
- Made sections, lessons, lesson contents, quizzes, and BTVN load as partial data so one failing endpoint no longer crashes the whole course detail page.
- Added a visible Vietnamese warning banner with retry when partial course data fails to load.
- Added empty states for courses with no sections, sections with no lessons, and resource groups with no items.
- Hardened API normalization for missing/null arrays, missing titles, missing progress values, and optional assignment data.

Validation:

- `cd frontend && npm run lint && npm run build`: passed.
- `cd frontend && VITE_USE_MOCK_DATA=false npm run build`: passed.
- `cd backend && npm run build`: passed after installing the missing declared backend dependencies in local `node_modules`.
- `cd backend && npm run test`: passed.
- `cd backend && npm run test:e2e`: failed because the existing e2e test initializes the full `AppModule` and times out during setup; rerunning with network access still timed out. This is a backend test setup issue, not caused by the Feat 4 frontend changes.

Review notes:

- No quiz page, quiz creation UI, ADMIN flow, account management, or add-student UI changes were made.
- Quiz resource links still point to the future Feat 6 route and remain intentionally unimplemented.

## Feat 9 - Vietnamese Copy With Diacritics

Status: ready for review.

Changed files:

- `frontend/src/components/CourseCard.jsx`
- `frontend/src/components/DashboardCard.jsx`
- `frontend/src/components/DevModeBanner.jsx`
- `frontend/src/components/Footer.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/mocks/auth/mockUsers.js`
- `frontend/src/mocks/classes/mockClasses.js`
- `frontend/src/mocks/courses/mockCourses.js`
- `frontend/src/pages/CourseDetail.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/dashboard/StudentDashboard.jsx`
- `frontend/src/pages/dashboard/TeacherDashboard.jsx`
- `frontend/src/services/api/course-detail.service.js`

What changed:

- Synced visible frontend copy to Vietnamese with proper diacritics across home/course cards, header/footer, dashboards, course detail tabs, loading/error/empty states, BTVN cards, resource groups, and dev mode banner.
- Updated mock user/course/lesson/assignment/discussion text that is rendered in the web UI.
- Updated real API fallback labels in course detail normalization without changing API calls, routes, payloads, or component behavior.

Validation:

- `cd frontend && npm run lint && npm run build`: passed.

Review notes:

- Feat 3-8 were intentionally skipped per current request.
