# Frontend Feature Progress

Updated on 2026-05-20.

## Working Rule

Implement one feature at a time, then stop for review. Do not continue to the next feature until the user approves.

## Feature Plan

- [x] Feat 1. Course detail resource formats per lesson: text, PDF/file, video, quiz.
- [x] Feat 2. Add BTVN card in the concrete course view.
- [ ] Feat 3. Move "add student" into each concrete class card.
- [ ] Feat 4. Stabilize concrete course detail failures with loading/error/empty states.
- [ ] Feat 5. Add teacher UI for creating quiz and load quiz list from DB.
- [ ] Feat 6. Make quiz click open a separate route/page.
- [ ] Feat 7. Add ADMIN/root role permission flow.
- [ ] Feat 8. Finish account management card UI.
- [x] Feat 9. Sync Vietnamese copy with proper diacritics across the whole web UI.

## Feature Plan - Vietnamese Source

- [x] Feat 1. Text, PDF, quiz: dinh dang tai nguyen cho tung bai hoc trong trang cu the khoa hoc.
- [x] Feat 2. Them the BTVN trong trang cu the khoa hoc.
- [ ] Feat 3. Dua thao tac them sinh vien vao dung the/lop cu the.
- [ ] Feat 4. Sua loi trang cu the khoa hoc thinh thoang bi loi.
- [ ] Feat 5. Them giao dien tao quiz va lay danh sach quiz tu DB.
- [ ] Feat 6. Bam vao quiz se mo page rieng, khong dung single-page tab.
- [ ] Feat 7. Tao role ADMIN/root co quyen quan tri.
- [ ] Feat 8. Code tiep giao dien the quan ly tai khoan.
- [x] Feat 9. Dong bo tieng Viet co dau tren toan web.

## Recommended Remaining Priority

1. Feat 4. Stabilize concrete course detail failures with loading/error/empty states.
2. Feat 3. Move "add student" into each concrete class card.
3. Feat 6. Make quiz click open a separate route/page.
4. Feat 5. Add teacher UI for creating quiz and load quiz list from DB.
5. Feat 8. Finish account management card UI.
6. Feat 7. Add ADMIN/root role permission flow.

Rationale:

- Feat 4 should be next because course detail is already the shared surface for Feat 1, Feat 2, Feat 5, and Feat 6. Hardening loading/error/empty states and API failure behavior first reduces regressions before adding quiz routes and quiz authoring UI.
- Feat 3 is a smaller dashboard UX change and can follow once course detail is stable.
- Feat 6 should come before Feat 5 because quiz resource links already point to `/courses/:courseId/quizzes/:quizId`, but that page is not implemented yet.
- Feat 5 is larger and likely to touch backend/API contracts.
- Feat 7 should be later because ADMIN/root permission flow has broader auth, route guard, and role implications.

## Prompt For Next Feature

```text
Đọc context repo tại docs/repo_context.md và docs/frontend_feature_progress.md.
Dùng workflow agents/skills/it4409-repo-workflow/SKILL.md nếu cần.
Repo hiện ở branch fix/frontend-audit-v2.

Feat 1 đã commit c7f78ad.
Feat 2 đã commit b159dd2.
Feat 9 đã commit 294ef68.
Trong docs/frontend_feature_progress.md, Feat 1, Feat 2 và Feat 9 đã được tick hoàn thành.
Theo priority hiện tại, bỏ qua Feat 3 và Feat 5-8, làm Feat 4: Stabilize concrete course detail failures with loading/error/empty states.

Rule:
- Chỉ làm đúng Feat 4.
- Không làm thêm feature khác.
- Preserve behavior hiện có; chỉ harden course detail loading/error/empty states và API failure handling.
- Không implement quiz page, quiz creation UI, ADMIN flow, account management, hoặc move add-student UI.
- Giữ tiếng Việt UI có dấu.
- Cập nhật các file context liên quan sau khi làm xong.
- Chạy validation frontend: cd frontend && npm run lint && npm run build.
- Làm xong dừng để tôi review.
```

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
