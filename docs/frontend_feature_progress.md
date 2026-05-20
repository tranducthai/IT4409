# Frontend Feature Progress

Updated on 2026-05-20.

## Working Rule

Implement one feature at a time, then stop for review. Do not continue to the next feature until the user approves.

## Feature Plan

1. Course detail resource formats per lesson: text, PDF/file, video, quiz.
2. Add BTVN card in the concrete course view.
3. Move "add student" into each concrete class card.
4. Stabilize concrete course detail failures with loading/error/empty states.
5. Add teacher UI for creating quiz and load quiz list from DB.
6. Make quiz click open a separate route/page.
7. Add ADMIN/root role permission flow.
8. Finish account management card UI.
9. Sync Vietnamese copy with proper diacritics across the whole web UI.

## Feature Plan - Vietnamese Source

1. Text, PDF, quiz: dinh dang tai nguyen cho tung bai hoc trong trang cu the khoa hoc.
2. Them the BTVN trong trang cu the khoa hoc.
3. Dua thao tac them sinh vien vao dung the/lop cu the.
4. Sua loi trang cu the khoa hoc thinh thoang bi loi.
5. Them giao dien tao quiz va lay danh sach quiz tu DB.
6. Bam vao quiz se mo page rieng, khong dung single-page tab.
7. Tao role ADMIN/root co quyen quan tri.
8. Code tiep giao dien the quan ly tai khoan.
9. Dong bo tieng Viet co dau tren toan web.

## Feat 1 - Course Detail Lesson Resources

Status: ready for review.

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
