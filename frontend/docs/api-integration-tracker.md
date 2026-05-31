# API Integration Tracker

File nay la tracker chinh cho viec noi API frontend/backend. Moi lan hoan thanh mot endpoint hoac mot batch nho, cap nhat tick/status trong file nay truoc khi chuyen sang batch tiep theo.

## Git Snapshot

- Working branch: `feat/p0-api-integration`
- Base branch: `origin/dev`
- Local `dev`: da dong bo voi `origin/dev`
- Real API mode:

```env
VITE_API_BASE_URL=http://127.0.0.1:3000/api
VITE_USE_MOCK_DATA=false
```

## Status Legend

- Done: da co backend, frontend da goi, UI da co state co ban.
- Partial: da co mot phan nhung con rui ro contract, performance, guard, hoac UI chua dung du lieu.
- Missing: chua noi hoac chua co endpoint.
- Verify: can chay real mode de test lai bang data that.

## API Contract Checklist

| Area | API contract | Backend | Frontend | Status | Notes |
|---|---|---:|---:|---|---|
| Auth | `POST /auth/login` | Yes | Yes | Done | Backend tra `access_token`, `refresh_token`; frontend map sang `accessToken`, `refreshToken`. |
| Auth | `POST /auth/register` | Yes | Yes | Done | Contract dung `full_name`; frontend da normalize tu `full_name`/`name`. |
| Auth | `POST /auth/refresh` | Yes | Yes | Done | Frontend retry 1 lan khi 401, gui `refresh_token`. |
| Auth | `GET /auth/me` | Yes | Yes | Done | Frontend hydrate user khi reload co token nhung mat `currentUser`. |
| Auth | `PATCH /auth/change-password` | Yes | Yes | Done | Co UI account management. |
| Class members | `GET /class-members/me/student-classes` | Yes | Yes | Done | Student dashboard da goi API khi mock off. |
| Class members | `GET /class-members/me/teacher-classes` | Yes | Yes | Done | Teacher dashboard da goi API khi mock off. |
| Class members | `GET /class-members/classes/:classId/pending` | Yes | Yes | Done | UI hien request id/class id/status; co the can enrich student info sau. |
| Class members | `PATCH /class-members/:id/approve` | Yes | Yes | Done | Teacher approve flow da goi API. |
| Class members | `POST /class-members` | Yes | Yes | Partial | Direct add student co frontend goi, backend endpoint hien chua guard role/auth. |
| Classes | `POST /classes` | Yes | Yes | Done | Frontend normalize class payload va gui `teacher_id`. |
| Classes | `PATCH /classes/:id` | Yes | Yes | Done | Frontend gui partial payload. |
| Classes | `DELETE /classes/:id` | Yes | Yes | Done | Client chap nhan response co body hoac 204. |
| Course detail | `GET /classes/:id` | Yes | Yes | Done | CourseDetail da load class detail. |
| Course detail | `GET /sections/class/:classId` | Yes | Yes | Done | CourseDetail da load sections. |
| Course detail | `GET /lessons/section/:sectionId` | Yes | Yes | Done | CourseDetail load lessons theo tung section. |
| Course detail | `GET /lesson-contents` | Yes | Yes | Partial | Dang load tat ca contents roi filter theo lesson id; nen co endpoint scoped theo lesson/class. |
| Course detail | `GET /quizzes/class/:classId` | Yes | Yes | Done | Resource tab hien quiz cua lop. |
| Course detail | `POST /quizzes` | Yes | Yes | Done | Teacher tao quiz tu CourseDetail. |
| Course detail | `GET /assignments/class/:classId` | Yes | Yes | Done | Assignment tab da dung API. |
| Course detail | `GET /discussions/class/:classId` | Yes | No | Missing | Backend co endpoint, CourseDetail chua load discussions tu API. |
| Quiz taking | `GET /quiz/:quizId` | Yes | Yes | Partial | FE moi hien cau hoi/options, chua co attempt state. |
| Quiz taking | `POST /quiz/:quizId/start` | Yes | No | Missing | FE co the noi ngay, BE da co endpoint attempt. |
| Quiz taking | `POST /quiz/:quizId/submit` | Yes | No | Missing | FE co the submit dap an A/B/C/D va hien ket qua. |
| Quiz taking | `GET /quiz/:quizId/attempts/me` | Yes | No | Missing | FE co the hien lich su lan lam/diem gan nhat. |
| Quiz taking | `GET /quiz/attempts/:attemptId` | Yes | No | Missing | FE co the hien ket qua chi tiet sau submit. |
| Lesson progress | `POST/PATCH /lessons/:lessonId/progress/me` | No | No | Missing | Can BE chot contract de danh dau bai hoc hoan thanh. |
| Progress | `GET /classes/:id/progress/me` or equivalent | No | No | Missing | Frontend dang fallback progress = 0. |
| Errors | NestJS error shape | Yes | Partial | Partial | Client chua normalize `message` dang array. |
| Tokens | Authorization header | Yes | Partial | Partial | Refresh da luu user neu backend tra ve; service van truyen token thu cong o nhieu cho. |

## Fix Priority Order

Thu tu de fix khuyen nghi, sap xep theo muc do anh huong va do phu thuoc:

1. P0 - Batch 2: API client cleanup - done, real API verified
  - Anh huong toan bo request, bao gom normalize error, token header, va FormData.
  - Nen tang da on de sang P1 khong bi loi hidden do client.
2. P0 - Batch 3: Course discussions - done enough for real API, UI polish con browser verify
  - Tab discussions da noi duoc API that va pass access control tren backend.
  - Con browser reload / UI polish neu muon verify them sau.
3. P1 - Batch 4: Lesson contents scoped endpoint
  - Giai quyet van de lay du lieu qua rong va co nguy co leak content.
4. P1 - Batch 5: Class member security and flow
  - Co yeu to security/role guard, can cham som truoc khi mo rong flow add/approve.
5. P2 - Batch 6: Quiz taking
  - La luong chuc nang lon, can them state attempt, submit, history va ket qua.
6. P2 - Batch 7: Lesson completion and progress
  - Co the de sau mot nhac, vi hien tai van co fallback 0 va chua chan demo chinh.
7. P3 - Batch 8: Real mode verification
  - Chot sau cung de xac nhan toan bo contract va UI hoat dong tren data that.

## P1 Kickoff Notes

Muc tieu sau P0:

- Batch 4 lam lesson contents scoped endpoint truoc, vi day la van de contract/data scope ro nhat va co nguy co leak neu de bulk load.
- Batch 5 lam class member security and flow ngay sau do, vi dashboard giang vien can dung scope, khong nen render theo kieu course list cua sinh vien.
- Khi bat dau P1, giu `Batch 6-8` chua dong vao state moi.

## Demo Seed Data

Backend co script seed demo idempotent:

```bash
cd backend
npm run seed:demo
```

Password chung cho tat ca account demo:

```text
Password123!
```

Demo accounts:

| Email | Role | Notes |
|---|---|---|
| `demo.admin@7study.local` | ADMIN | Dung de test route/admin UI neu can. |
| `demo.teacher.linh@7study.local` | TEACHER | Day `SEED-REACT`, `SEED-AI`. |
| `demo.teacher.khoa@7study.local` | TEACHER | Day `SEED-DB`. |
| `demo.student.anh@7study.local` | STUDENT | Active trong `SEED-REACT`, `SEED-DB`. |
| `demo.student.bao@7study.local` | STUDENT | Active trong `SEED-REACT`, `SEED-AI`; pending trong `SEED-DB`. |
| `demo.student.chi@7study.local` | STUDENT | Active trong `SEED-REACT`, `SEED-AI`. |
| `demo.student.dung@7study.local` | STUDENT | Active trong `SEED-DB`, `SEED-AI`. |
| `demo.student.pending@7study.local` | STUDENT | Pending trong `SEED-REACT`. |

Seeded classes:

| Join code | Class | Teacher | Content |
|---|---|---|---|
| `SEED-REACT` | Lap trinh giao dien voi React | `demo.teacher.linh@7study.local` | Sections, lessons, quiz, questions, assignments, discussion/messages. |
| `SEED-DB` | Co so du lieu ung dung | `demo.teacher.khoa@7study.local` | Sections, lessons, quiz, questions, assignments, discussion/messages. |
| `SEED-AI` | Nhap mon tri tue nhan tao | `demo.teacher.linh@7study.local` | Sections, lessons, quiz, questions, assignments, discussion/messages. |

Known seed caveat:

- DB hien tai chua co table `lesson_contents`, nen seed script skip table nay an toan. Course detail van co sections/lessons/quizzes/assignments/discussions; resource lesson contents se can xu ly o Batch 4.

## UI Fix Tracker

UI fixes da lam sau Batch 1 API:

- [x] Them hover/focus/active effect chung qua `.action-btn`, ap dung cho cac nut hanh dong chinh.
- [x] Dua quan ly tai khoan ra route rieng `/account`, khong de card doi mat khau nam trong dashboard.
- [x] Them route `/profile` co form cap nhat `full_name` va `avatar_url`.
- [x] Sua layout dashboard/course detail/quiz detail de noi dung co width dong bo hon.
- [x] Sua form doi mat khau sang stack doc va them validate FE: bat buoc, confirm match, min 6 ky tu, mat khau moi khac mat khau cu.
- [x] Sua account menu tren header: trigger la button co aria, co active state, co thong tin user, dong khi bam ngoai/Escape, bo item trung lap "Tiep tuc khoa hoc gan nhat".
- [x] Sua login/register dark mode label/input, bo link quen mat khau dang tro `#`, them hover/focus chung cho link phu.
- [x] Sua CourseCard hover/focus va mau border/text dong bo voi theme moi.
- [x] Sua Footer mobile padding/gap de khong bi chat ngang tren man hinh nho.
- [x] Tach Profile va Account thanh cac panel ngang hang, tranh form/card bi long trong card lon.

UI verification:

- [x] `npm run lint` trong `frontend`.
- [x] `npm run build` trong `frontend`.
- [x] `git diff --check`.
- [ ] Browser visual review chua chay tu agent vi moi truong hien khong expose shared VS Code browser/Playwright.

## Integration Plan

### Batch 1: Auth/session hydration

Goal: reload trang khong mat role routing khi van con access token.

Scope:

- Frontend only.
- Khong doi backend vi `GET /auth/me` da co trong `AuthController`.
- Khong doi UI lon; chi them state can thiet de route guard cho hydrate session.

Files expected:

- `frontend/src/services/api/auth.service.js`
- `frontend/src/services/api/client.js`
- `frontend/src/services/api/session.js`
- `frontend/src/components/RouteGuards.jsx`
- Co the them helper nho trong `frontend/src/services/api/authState.js` neu can.

Implementation steps:

- [x] Them `getCurrentUserFromApi()` vao `auth.service.js`.
  - Goi `apiRequest('/auth/me', { method: 'GET' })`.
  - Neu thanh cong thi `setCurrentUser(user)` va return user.
  - Neu loi 401/403 thi clear auth state.
- [x] Cap nhat refresh flow trong `client.js`.
  - Hien tai `tryRefreshToken()` chi luu token.
  - Neu response refresh co `user`, luu user vao session storage.
  - Giu fallback cu neu backend khong tra user.
- [x] Thiet ke hydrate session cho route guard.
  - Neu co token va co `currentUser`: cho vao route nhu hien tai.
  - Neu khong co token: redirect login.
  - Neu co token nhung chua co `currentUser`: goi `/auth/me` truoc khi quyet dinh redirect.
  - Trong luc hydrate, hien loading nho de tranh redirect sai.
- [x] Tranh clear session qua som.
  - Hien tai `RequireAuth` clear auth state ngay khi thieu user.
  - Can doi logic nay de thu hydrate truoc.
- [x] Kiem tra `RequireGuest`.
  - Neu co token nhung chua co user, thu hydrate.
  - Neu hydrate thanh cong: redirect `/dashboard`.
  - Neu hydrate fail: clear session va cho vao login/register.
- [x] Kiem tra `RequireRole` va `DashboardRoute`.
  - Role phai normalize uppercase.
  - Sau hydrate, role routing van dung `TEACHER`, `STUDENT`, `ADMIN`.

Manual test cases:

- [ ] Login student thanh cong, reload `/dashboard/student`, van o dashboard student.
- [ ] Login teacher thanh cong, reload `/dashboard/teacher`, van o dashboard teacher.
- [ ] Login teacher, vao `/courses/:courseId`, reload trang, khong bi day ve login.
- [ ] Xoa only `it4409_current_user` trong localStorage, giu access token, reload dashboard, frontend goi `/auth/me` va khoi phuc user.
- [ ] Xoa/lam hong access token, reload protected route, frontend clear auth state va redirect login.
- [ ] Logout xong back/refresh protected route khong vao lai duoc.

Automated/check commands:

- [x] `npm run lint` trong `frontend`.
- [x] `npm run build` trong `frontend`.
- [x] `VITE_USE_MOCK_DATA=false VITE_API_BASE_URL=http://127.0.0.1:3000/api npm run build` trong `frontend`.

Real API/module verification:

- [x] Backend start duoc voi Neon/Postgres khi chay ngoai sandbox network.
- [x] API thật: register student, `/auth/me`, refresh, `/auth/me` sau refresh, login deu pass.
- [x] API thật: register teacher, `/auth/me`, refresh, `/auth/me` sau refresh, login deu pass.
- [x] Negative API: `/auth/me` khong token tra 401.
- [x] Negative API: `/auth/me` token hong tra 401.
- [x] Negative API: `/auth/refresh` refresh token hong tra 401.
- [x] Frontend real-mode server start duoc va SPA fallback `/dashboard` tra HTML.
- [x] Vite SSR module test: `getCurrentUserFromApi()` goi backend that va persist `currentUser`.
- [x] Vite SSR module test: `apiRequest()` gap 401 thi refresh token, retry request, thay access token, va persist `user`.
- [x] Vite SSR module test: invalid refresh clear stale auth state.
- [ ] Browser automation reload test chua chay vi moi truong hien khong co Playwright/Chromium/jsdom.

Post-test review:

- Result: Batch 1 code du de giu. Khong thay blocking issue trong hydrate/session flow.
- API response verified: `register`, `login`, `refresh`, `/auth/me` deu tra user khong leak `password`.
- Route guard behavior verified at module/API level, chua verified bang browser reload that.

Risk ranking:

| Rank | Risk | Impact | Proposal |
|---:|---|---|---|
| 1 | Chua test browser reload that vi thieu Playwright/Chromium/jsdom | Co the con bug chi xay ra trong runtime browser, vi module test khong cover full React Router navigation/reload | Khi co browser tool, test lai 6 manual cases ben tren; neu can thi install Playwright rieng cho frontend test. |
| 2 | Test da tao user tam trong DB that | DB se co them account `batch1.*@example.com` va `hydration.module.*@example.com` | Them cleanup script/API admin sau, hoac dung email prefix rieng va xoa bang DB khi chot integration. |
| 3 | Hydration hook nam rieng trong moi route guard | Parent/child guard co the moi guard khoi tao hook rieng, nhung hien parent guard hydrate truoc nen rui ro thap | Neu sau nay routing phuc tap hon, nen dua session hydration len provider/global auth context. |
| 4 | `apiRequest()` van hardcode `Content-Type: application/json` | Se gay loi khi Batch sau co upload `FormData` | Xu ly o Batch 2 API client cleanup: chi set JSON content type khi body khong phai `FormData`. |

Review checklist:

- [x] Khong tao vong lap hydrate lien tuc khi `/auth/me` fail.
- [x] Khong fetch `/auth/me` moi lan render neu da co user.
- [x] Khong clear valid refresh token truoc khi co co hoi refresh/hydrate.
- [x] Mock mode van hoat dong nhu cu.
- [x] Khong lam thay doi contract login/register hien co.

### Batch 2: API client cleanup

Goal: client on dinh truoc khi noi them man hinh.

Files expected:

- `frontend/src/services/api/client.js`
- `frontend/src/services/api/auth.service.js`
- `frontend/src/services/api/discussions.service.js`
- `frontend/src/services/api/course-detail.service.js`
- `frontend/src/services/api/submissions.service.js`
- `frontend/src/services/api/lessons.service.js`
- `frontend/src/services/api/sections.service.js`

Implementation steps:

- [x] Normalize error shape trong `client.js`.
  - Neu `data.message` la array, join thanh 1 chuoi doc duoc truoc khi throw `ApiError`.
  - Giu nguyen `status` va `payload` de cac man hinh co the parse lai neu can.
- [x] Tach logic header theo loai body.
  - Chi gan `Content-Type: application/json` khi body la JSON string / plain object.
  - Khong set `Content-Type` khi gui `FormData` hoac upload file.
- [x] Loai header Authorization thu cong o service layer.
  - Kiem tra cac service dang tu gan `Authorization` khong can thiet.
  - De `apiRequest()`/`apiUpload()` la no i duy nhat gan bearer token.
- [ ] Giu refresh flow on dinh.
  - Khi refresh token het han, clear auth state va khong retry vo han.
  - Khi refresh thanh cong, van persist `currentUser` neu backend tra user.
- [ ] Chot contract loi cho UI.
  - Login sai mat khau, 403/401, va refresh token hong phai ra message de doc duoc.
  - Khong doi shape response thanh cong.

Manual test cases:

- [ ] Dang nhap sai password va kiem tra message hien ro.
- [ ] Goi request yeu cau auth khi access token het han de test refresh/retry.
- [ ] Test refresh token het han de dam bao auth state bi clear dung luc.
- [ ] Neu co upload file trong luong lien quan, xac minh FormData khong bi gan JSON content-type.

Review checklist:

- [ ] Public API cua service khong doi ngoai viec loi de doc hon.
- [ ] Khong lam hong mock mode.
- [ ] Khong tao regression voi request co body JSON thong thuong.

### Batch 3: Course discussions

Goal: tab Thao luan dung API that.

Files expected:

- `frontend/src/pages/CourseDetail.jsx`
- `frontend/src/services/api/discussions.service.js`
- `frontend/src/services/api/course-detail.service.js`
- `backend/src/modules/discussions/discussions.controller.ts`
- `backend/src/modules/discussions/discussions.service.ts`

Implementation steps:

- [ ] Dung `GET /discussions/class/:classId` lam nguon data chinh cho tab Thao luan.
  - Reuse `getDiscussionsByClass(classId)` trong service hien co.
  - Khong load discussions bang cach khac neu co classId ro rang.
- [ ] Normalize data discussions ve 1 shape UI on dinh.
  - Dam bao `title`, `content`, `createdAt`, `author`, `classId` luon co gia tri fallback.
  - Giu mapping tu API sang UI o 1 cho de de fix ve sau.
- [ ] Tach state loading/empty/error cho discussions.
  - Loading khong nen block toan bo course detail.
  - Empty state phai phan biet giua "chua co bai dang" va "khong tai duoc du lieu".
- [ ] Dam bao chi doc khi user co quyen.
  - Backend da co guard trong `DiscussionsService.ensureClassAccess`, nen frontend chi can gui request co Bearer token.
  - Neu 401/403, hien warning ro rang thay vi fail ngam.
- [ ] Hook vao UI course detail.
  - Tab Thao luan phai nhan duoc data, warning va refresh state ma khong lam den cac tab khac.

Manual test cases:

- [ ] Student mo course detail va xem duoc danh sach discussions cua lop minh.
- [ ] Teacher mo course detail va xem discussions cua lop minh.
- [ ] User khong thuoc lop khong xem duoc discussions.
- [ ] Test tab discussions khi API loi de kiem tra warning va empty state.

Review checklist:

- [ ] Discussions chi tai dung scope theo classId.
- [ ] Khong lam cham toan bo course detail khi discussions loi.
- [ ] UI co loading/empty/error phan biet ro rang.

### Batch 4: Lesson contents scoped endpoint

Goal: tranh goi `/lesson-contents` lay toan bo data.

- [ ] Chon contract: `GET /lesson-contents/lesson/:lessonId` hoac `GET /lesson-contents/class/:classId`.
- [ ] Them backend endpoint scoped.
- [ ] Doi frontend CourseDetail sang endpoint scoped.
- [ ] Test manual: course co nhieu lesson, resource count dung, link open file/quiz dung.
- [ ] Review: query backend khong leak content cua class khac.

### Batch 5: Class member security and flow

Goal: dong bo flow them/duyet sinh vien.

- [ ] Xac nhan co cho phep teacher direct-add hay chi join request.
- [ ] Neu direct-add: them guard/auth cho `POST /class-members` va verify teacher owns class.
- [ ] Neu chi join request: UI teacher khong goi direct-add nua, thay bang approve pending request.
- [ ] Teacher dashboard chi hien lop phu trach va yeu cau cho duyet, khong render course-style cards hay label sai scope.
- [ ] Test manual: teacher them/duyet, student thay lop sau khi refresh dashboard.
- [ ] Test manual: teacher login vao dashboard khong thay giao dien nhu student course list.
- [ ] Review: khong de user bat ky tao membership tuy y.

### Batch 6: Quiz taking

Goal: quiz trac nghiem co the lam va nop bai bang endpoint BE hien co.

FE-only scope neu BE giu contract hien tai:

- [ ] Them service `startQuizAttempt(quizId)` goi `POST /quiz/:quizId/start`.
- [ ] Them service `submitQuizAttempt(quizId, attemptId, answers)` goi `POST /quiz/:quizId/submit`.
- [ ] Them service `getMyQuizAttempts(quizId)` goi `GET /quiz/:quizId/attempts/me`.
- [ ] Doi `QuizDetail` tu danh sach text sang form radio A/B/C/D.
- [ ] Them state attempt: chua bat dau, dang lam, da nop, qua han, loi submit.
- [ ] Hien timer dua tren `expires_at`; disable nop khi het gio hoac dang submit.
- [ ] Sau submit hien score, so cau dung/tong cau, va dap an da chon.
- [ ] Teacher xem quiz o che do preview/read-only, student moi lam/nop.
- [ ] Test manual: student start quiz demo, chon dap an, submit, reload thay attempt/history.
- [ ] Review: khong hien `correct_answer` truoc khi submit.

Out of FE scope:

- Free-text/self-written quiz answer chua co BE support; contract hien tai chi chap nhan `A`, `B`, `C`, `D`.

### Batch 7: Lesson completion and progress

Goal: tab Tien do khong con hardcode 0 khi real mode.

- [ ] Cho BE chot endpoint danh dau bai hoc hoan thanh, de xuat `POST /lessons/:lessonId/complete` hoac `PATCH /lessons/:lessonId/progress/me`.
- [ ] Cho BE chot endpoint tong hop tien do, de xuat `GET /classes/:classId/progress/me`.
- [ ] Sau khi co BE: them service lesson/progress trong FE.
- [ ] Doi `course-detail.service.js` khong hardcode `lesson.status = 'todo'` nua.
- [ ] Chau chuot tab Bai hoc: phan biet ro `done` / `in-progress` / `todo`, co loading/empty/error state rieng, va khong de lesson list bi nhin nhu noi dung dump.
- [ ] Them nut/trang thai "Danh dau da hoc" trong tab Bai hoc cho student va giu read-only hop ly cho teacher.
- [ ] Doi CourseDetail load progress tu endpoint moi.
- [ ] Test manual: student co data progress, teacher xem course khong crash, va tab Bai hoc khong gay roi man hinh.
- [ ] Review: progress contract co default ro rang khi chua co activity.

### Batch 8: Real mode verification

Goal: chot batch integration dau tien co the demo.

- [ ] Tao/cap nhat `.env.local` frontend cho real API mode.
- [ ] Chay backend.
- [ ] Chay frontend.
- [ ] Test tai khoan student: login, dashboard, course detail, resources, assignments, discussions.
- [ ] Test tai khoan teacher: login, dashboard, create/update/delete class, pending approve, create quiz.
- [ ] Chay `npm run lint` va `npm run build` trong frontend.
- [ ] Neu sua backend: chay backend build/test lien quan.

## Update Rule

Khi hoan thanh mot viec:

1. Doi status trong bang `API Contract Checklist`.
2. Tick checkbox trong batch tuong ung.
3. Ghi them note ngan neu contract thay doi.
4. Chay test/lint phu hop voi batch.
5. Review diff truoc khi sang batch moi.
