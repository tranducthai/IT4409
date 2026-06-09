# Bao cao du an - 7Study LMS

> Tai lieu nay la khung bao cao chi tiet cho do an mon hoc. Co the dung truc tiep de viet bao cao Word/PDF, sau do bo sung anh chup man hinh, ten thanh vien, phan cong cong viec va nhan xet ca nhan.

## 1. Thong tin chung

### 1.1. Ten de tai

Xay dung he thong quan ly hoc tap truc tuyen 7Study LMS.

### 1.2. Boi canh

Trong moi truong giao duc hien dai, nhu cau quan ly lop hoc, tai nguyen hoc tap, bai kiem tra, bai tap va tuong tac giua giao vien voi sinh vien ngay cang lon. Cac lop hoc khong chi can noi luu tru tai lieu, ma con can mot he thong co kha nang:

- Quan ly nguoi dung theo vai tro.
- To chuc lop hoc va noi dung bai hoc.
- Theo doi tien do hoc tap.
- Cho phep sinh vien lam quiz, nop bai tap va tham gia thao luan.
- Cho phep giao vien quan ly hoc lieu va danh gia sinh vien.

Du an 7Study LMS duoc xay dung nhu mot nen tang hoc tap thu gon, tap trung vao cac chuc nang cot loi cua mot Learning Management System phu hop voi pham vi MVP cua do an mon hoc.

### 1.3. Muc tieu de tai

Muc tieu cua du an la xay dung mot ung dung web ho tro day va hoc, co cac chuc nang chinh:

- Dang ky, dang nhap va quan ly phien dang nhap bang JWT.
- Phan quyen nguoi dung theo 3 vai tro: Admin, Giao vien, Sinh vien.
- Quan ly lop hoc, thanh vien lop va trang thai tham gia lop.
- Quan ly bai hoc theo cau truc section/lesson.
- Ho tro nhieu loai noi dung bai hoc: text, video YouTube, file, quiz.
- Upload va quan ly tai nguyen lop hoc thong qua Supabase Storage.
- Tao va lam quiz.
- Tao bai tap, nop bai va cham diem.
- Tao thao luan va tin nhan trong lop.
- Co bo du lieu test thuc te dua tren khoa CS50W cua Harvard de demo end-to-end.

### 1.4. Pham vi MVP

Trong pham vi MVP, he thong tap trung vao cac luong chinh:

- Admin quan ly tong quan nguoi dung/lop hoc.
- Giao vien tao va quan ly lop hoc, bai hoc, tai nguyen, quiz, bai tap, thao luan.
- Sinh vien tham gia lop, hoc bai, lam quiz, nop bai, trao doi trong discussion.

Mot so chuc nang nang cao nhu realtime notification, phan tich nang cao, import/export du lieu hang loat va mobile app chua nam trong pham vi chinh cua MVP.

## 2. Cong nghe su dung

### 2.1. Tong quan stack

| Thanh phan | Cong nghe |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL/Neon |
| ORM | TypeORM |
| Authentication | JWT access token va refresh token |
| File storage | Supabase Storage |
| API document | Swagger |
| Test/build | npm scripts, ESLint, Vite build, Nest build |

### 2.2. Ly do lua chon

React va Vite duoc dung cho frontend vi phu hop voi ung dung web mot trang, co toc do dev nhanh va de chia component theo chuc nang.

NestJS duoc dung cho backend vi cung cap cau truc module ro rang, phu hop voi cac domain nhu users, classes, lessons, quizzes, assignments, discussions. NestJS cung ho tro tot dependency injection, guard, controller, service va testing.

PostgreSQL/Neon duoc dung de luu tru du lieu quan he nhu users, classes, memberships, lessons, questions, submissions. TypeORM giup anh xa entity voi bang du lieu va quan ly migration.

Supabase Storage duoc dung de luu tru file tai nguyen nho, file dinh kem bai tap va file nop bai. Database chi luu URL va metadata cua file, khong luu binary truc tiep.

## 3. Phan tich yeu cau

### 3.1. Tac nhan trong he thong

He thong co 3 vai tro chinh:

| Vai tro | Mo ta |
| --- | --- |
| Admin | Quan ly tong quan he thong, nguoi dung va lop hoc |
| Giao vien | Tao lop, quan ly thanh vien, bai hoc, tai nguyen, quiz, bai tap va thao luan |
| Sinh vien | Tham gia lop, hoc bai, lam quiz, nop bai va thao luan |

### 3.2. Yeu cau chuc nang cho Admin

Admin can thuc hien duoc cac chuc nang:

- Xem thong ke tong quan he thong.
- Xem danh sach nguoi dung.
- Xem so luong nguoi dung theo vai tro.
- Xem danh sach lop hoc.
- Ho tro kiem tra du lieu toan he thong trong giai do demo.

### 3.3. Yeu cau chuc nang cho Giao vien

Giao vien can thuc hien duoc cac chuc nang:

- Dang nhap bang tai khoan giao vien.
- Tao lop hoc voi ten, mo ta, anh dai dien, ma vao lop.
- Sua/xoa lop hoc do minh quan ly.
- Xem danh sach sinh vien dang cho duyet.
- Duyet yeu cau tham gia lop.
- Them/sua/xoa section va lesson.
- Tao lesson co type text, video, file hoac quiz.
- Upload file tai nguyen lop hoc.
- Tao folder tai nguyen.
- Tao assignment co deadline va file dinh kem.
- Xem submission cua sinh vien va cham diem.
- Tao discussion va gui message.
- Xem tien do hoc tap cua sinh vien.

### 3.4. Yeu cau chuc nang cho Sinh vien

Sinh vien can thuc hien duoc cac chuc nang:

- Dang nhap bang tai khoan sinh vien.
- Xem danh sach lop da tham gia.
- Gui yeu cau tham gia lop bang join code.
- Mo lop hoc va xem bai hoc.
- Xem text lesson inline.
- Mo video YouTube va file tai lieu.
- Danh dau bai hoc da hoc.
- Lam quiz va xem ket qua.
- Nop assignment.
- Gui message trong discussion.

### 3.5. Yeu cau phi chuc nang

- Giao dien de su dung va phan tach theo vai tro.
- API co cau truc module ro rang.
- Du lieu co quan he khoa ngoai de dam bao tinh nhat quan.
- File upload khong luu truc tiep trong database.
- Co kha nang chay local bang `.env`.
- Co seed data de demo nhanh va kiem thu luong thuc.

## 4. Thiet ke tong quan he thong

### 4.1. Mo hinh kien truc

He thong duoc chia thanh 3 lop chinh:

```text
Browser
  |
  | HTTP/JSON + JWT
  v
React Frontend
  |
  | REST API
  v
NestJS Backend
  |
  | TypeORM
  v
PostgreSQL/Neon

Backend
  |
  | Upload file
  v
Supabase Storage
```

Frontend chiu trach nhiem hien thi giao dien, dieu huong route, luu token trong localStorage va goi API.

Backend chiu trach nhiem xu ly nghiep vu, kiem tra quyen, thao tac database va upload file.

Database luu du lieu co cau truc. Supabase luu file va tra ve URL de frontend mo/tai file.

### 4.2. Cau truc thu muc chinh

```text
IT4409/
  backend/
    src/
      modules/
        auth/
        users/
        classes/
        class-members/
        sections/
        lessons/
        lesson-contents/
        class-resources/
        quizzes/
        questions/
        quiz-attempts/
        quiz-answers/
        assignments/
        submissions/
        discussions/
        messages/
      migrations/
      scripts/
  frontend/
    src/
      pages/
      pages/dashboard/
      components/
      services/api/
      mocks/
  README.md
  cs50w_seed_course.yaml
```

### 4.3. Luong dang nhap va phan quyen

Luong dang nhap:

1. Nguoi dung nhap email va password.
2. Frontend goi `POST /api/auth/login`.
3. Backend kiem tra email va password bang bcrypt.
4. Backend tra ve access token, refresh token va user da sanitize.
5. Frontend luu token va current user trong localStorage.
6. Frontend redirect theo role:
   - `ADMIN` -> `/dashboard/admin`
   - `TEACHER` -> `/dashboard/teacher`
   - `STUDENT` -> `/dashboard/student`

Du lieu localStorage chinh:

```text
it4409_access_token
it4409_refresh_token
it4409_current_user
```

Khi API tra `401`, frontend co co che thu refresh token. Neu refresh that bai thi clear auth state va dua ve trang login.

## 5. Thiet ke co so du lieu

### 5.1. Nhom bang nguoi dung va lop hoc

| Bang | Muc dich |
| --- | --- |
| `users` | Luu tai khoan nguoi dung va role |
| `classes` | Luu lop hoc |
| `class_members` | Luu quan he user-lop va trang thai tham gia |

Bang `users` co cac truong chinh:

- `id`
- `full_name`
- `email`
- `password`
- `role`
- `avatar_url`
- `created_at`
- `updated_at`

Bang `classes` co cac truong chinh:

- `id`
- `name`
- `description`
- `avatar_url`
- `type`
- `teacher_id`
- `join_code`
- `is_active`

Bang `class_members` co cac truong chinh:

- `id`
- `class_id`
- `user_id`
- `role`
- `status`
- `joined_at`

Trang thai class member:

| Status | Y nghia |
| --- | --- |
| `ACTIVE` | Da la thanh vien lop |
| `PENDING` | Da gui yeu cau, dang cho giao vien duyet |
| `REJECTED` | Bi tu choi |

### 5.2. Nhom bang bai hoc

| Bang | Muc dich |
| --- | --- |
| `sections` | Chia lop thanh cac phan/tuan |
| `lessons` | Luu bai hoc va noi dung chinh |
| `lesson_progresses` | Luu tien do bai hoc da hoan thanh cua sinh vien |

Trong schema hien tai, noi dung bai hoc da duoc merge vao bang `lessons`. Moi lesson co the co:

- `type`: `text`, `video`, `file`, `quiz`
- `file_url`: URL video/file/quiz reference neu co
- `content`: noi dung text hoac reference
- `duration`: thoi luong uoc tinh
- `quiz_id`: quiz gan voi lesson neu lesson la quiz

Loai lesson:

| Type | Cach hien thi |
| --- | --- |
| `text` | Hien thi noi dung inline |
| `video` | Mo URL YouTube |
| `file` | Mo file Supabase/PDF/ZIP |
| `quiz` | Dieu huong sang trang quiz |

### 5.3. Nhom bang quiz

| Bang | Muc dich |
| --- | --- |
| `quizzes` | Thong tin quiz |
| `questions` | Cau hoi cua quiz |
| `quiz_attempts` | Lan lam bai cua sinh vien |
| `quiz_answers` | Cau tra loi tung cau |

Luong lam quiz:

1. Sinh vien mo lesson type quiz.
2. Frontend dieu huong sang trang quiz.
3. Backend tra thong tin quiz va cau hoi.
4. Sinh vien chon dap an va submit.
5. Backend tao attempt, luu answers va tinh diem.

### 5.4. Nhom bang assignment

| Bang | Muc dich |
| --- | --- |
| `assignments` | Bai tap giao vien tao |
| `assignment_attachments` | File/link dinh kem cua bai tap |
| `assignment_submissions` | Bai nop cua sinh vien |
| `assignment_submission_files` | File trong bai nop |

Luong assignment:

1. Giao vien tao assignment va deadline.
2. Giao vien co the dinh kem link/file.
3. Sinh vien nop bai.
4. Giao vien xem submission, cham diem va feedback.

### 5.5. Nhom bang discussion

| Bang | Muc dich |
| --- | --- |
| `discussions` | Chu de thao luan trong lop |
| `messages` | Tin nhan trong discussion |

Message gan voi user nen co the biet ai gui: giao vien hay sinh vien.

### 5.6. Nhom bang tai nguyen lop

| Bang | Muc dich |
| --- | --- |
| `class_resource_folders` | Thu muc tai nguyen cua lop |
| `class_resources` | File/link tai nguyen |

File duoc upload len Supabase, bang `class_resources` chi luu:

- `file_url`
- `original_name`
- `file_name`
- `mime_type`
- `size`
- `uploaded_by`
- `folder_id`

## 6. Thiet ke API va module backend

Backend duoc to chuc theo module. Moi module thuong co:

- Controller: dinh nghia endpoint.
- Service: xu ly nghiep vu.
- Repository: thao tac database.
- DTO: validate du lieu request.
- Entity: map voi bang database.

### 6.1. Auth module

Chuc nang:

- Register.
- Login.
- Refresh token.
- Lay thong tin current user.
- Doi mat khau.
- Forgot/reset password o muc co endpoint.

Endpoint tieu bieu:

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET  /api/auth/me
PATCH /api/auth/change-password
```

### 6.2. Classes va Class Members

Chuc nang:

- Tao/sua/xoa/xem lop.
- Lay lop cua giao vien.
- Lay lop cua sinh vien.
- Sinh vien request join.
- Giao vien duyet request join.
- Lay danh sach pending requests.

Endpoint tieu bieu:

```text
GET  /api/classes
GET  /api/classes/:id
POST /api/classes
PATCH /api/classes/:id
DELETE /api/classes/:id

GET  /api/class-members/me/teacher-classes
GET  /api/class-members/me/student-classes
POST /api/class-members/me/request-join
PATCH /api/class-members/:id/approve
GET  /api/class-members/classes/:classId/pending
```

### 6.3. Sections va Lessons

Chuc nang:

- Tao section.
- Lay sections theo class.
- Tao lesson.
- Lay lessons theo section.
- Sua/xoa lesson.
- Danh dau lesson da hoc.

Endpoint tieu bieu:

```text
GET  /api/sections/class/:classId
POST /api/sections

GET  /api/lessons/section/:sectionId
POST /api/lessons
PATCH /api/lessons/:id
DELETE /api/lessons/:id
POST /api/lessons/:lessonId/progress/me
```

### 6.4. Resources

Chuc nang:

- Upload file tai nguyen lop.
- Tao folder tai nguyen.
- Xem file/folder.
- Xoa file/folder.

Endpoint tieu bieu:

```text
GET  /api/class-resources/class/:classId
POST /api/class-resources/class/:classId/upload
GET  /api/class-resources/class/:classId/folders
POST /api/class-resources/class/:classId/folders
DELETE /api/class-resources/:resourceId
DELETE /api/class-resources/folders/:folderId
```

### 6.5. Quiz

Endpoint tieu bieu:

```text
GET  /api/quizzes/class/:classId
GET  /api/quiz/:quizId
POST /api/quiz/:quizId/start
POST /api/quiz/:quizId/submit
GET  /api/quiz/:quizId/attempts/me
```

### 6.6. Assignment va Submission

Endpoint tieu bieu:

```text
GET  /api/assignments/class/:classId
POST /api/assignments
PATCH /api/assignments/:id
DELETE /api/assignments/:id

POST /api/submissions/assignment/:assignmentId
GET  /api/submissions/assignment/:assignmentId
GET  /api/submissions/assignment/:assignmentId/me
PATCH /api/submissions/:id/grade
```

### 6.7. Discussion va Message

Endpoint tieu bieu:

```text
GET  /api/discussions/class/:classId
POST /api/discussions
GET  /api/messages/discussion/:discussionId
POST /api/messages
```

## 7. Thiet ke frontend

### 7.1. Route chinh

| Route | Chuc nang |
| --- | --- |
| `/` | Trang chu |
| `/login` | Dang nhap |
| `/register` | Dang ky |
| `/dashboard` | Route trung gian dieu huong theo role |
| `/dashboard/admin` | Dashboard admin |
| `/dashboard/teacher` | Dashboard giao vien |
| `/dashboard/student` | Dashboard sinh vien |
| `/courses/:courseId` | Chi tiet lop hoc |
| `/courses/:courseId/quizzes/:quizId` | Lam quiz |
| `/profile` | Ho so nguoi dung |
| `/account` | Tai khoan |

### 7.2. Route guard

Frontend co cac guard:

- `RequireAuth`: bat buoc co token.
- `RequireGuest`: neu da dang nhap thi khong vao login/register.
- `RequireRole`: chi cho vai tro phu hop vao route.
- `DashboardRoute`: doc role va dieu huong den dashboard tuong ung.

### 7.3. Dashboard theo vai tro

Admin dashboard:

- Hien tong quan users/classes.
- Hien so luong theo role.

Teacher dashboard:

- Hien lop giao vien quan ly.
- Tao/sua/xoa lop.
- Xem request sinh vien dang cho duyet.
- Duyet/reject sinh vien.

Student dashboard:

- Hien lop da tham gia.
- Nhap join code de xin vao lop.

### 7.4. Course Detail

Trang chi tiet lop hoc co cac tab:

- Bai hoc.
- BTVN.
- Tai nguyen.
- Tien do.
- Thao luan.

Trong tab Bai hoc, lesson co type:

- `Text`: hien inline.
- `Video`: mo YouTube URL.
- `PDF/File`: mo link file.
- `Quiz`: mo trang quiz.

## 8. Bo du lieu demo CS50W

Du an co seed data dua tren khoa:

```text
CS50's Web Programming with Python and JavaScript
```

Seed file:

```text
cs50w_seed_course.yaml
```

Lenh chay seed:

```bash
cd backend
npm run seed:cs50w
```

Seed tao:

- 1 course CS50W.
- 1 giao vien demo.
- 5 sinh vien active.
- 2 sinh vien pending.
- 1 sinh vien rejected.
- 5 section.
- 26 lesson.
- 5 quiz.
- 12 resource.
- 1 discussion.
- 1 assignment.
- Submission mau.

Tai nguyen local da tai ve nam o:

```text
/tmp/cs50w_resources
```

Khi chay seed, file PDF/ZIP duoc upload len Supabase bucket `cs50w-resources`.

Account demo:

| Case | Email | Password |
| --- | --- | --- |
| Giao vien | `teacher.cs50w@7study.local` | `Password123!` |
| SV active | `student.cs50w@7study.local` | `Password123!` |
| SV frontend | `student.frontend.cs50w@7study.local` | `Password123!` |
| SV backend | `student.backend.cs50w@7study.local` | `Password123!` |
| SV QA | `student.qa.cs50w@7study.local` | `Password123!` |
| SV fullstack | `student.fullstack.cs50w@7study.local` | `Password123!` |
| SV pending 1 | `student.pending1.cs50w@7study.local` | `Password123!` |
| SV pending 2 | `student.pending2.cs50w@7study.local` | `Password123!` |
| SV rejected | `student.rejected.cs50w@7study.local` | `Password123!` |

Join code:

```text
CS50W-2026
```

## 9. Kiem thu

### 9.1. Kiem thu build

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

### 9.2. Kiem thu migration

```bash
cd backend
npm run migration:show
npm run migration:run
```

### 9.3. Kiem thu seed data

```bash
cd backend
npm run seed:cs50w
```

Ky vong:

- Seed chay thanh cong.
- Co class CS50W.
- Co user giao vien va sinh vien.
- Co sections, lessons, quizzes, resources, discussions, assignments.

### 9.4. Kiem thu thu cong theo luong demo

Luong giao vien:

1. Login `teacher.cs50w@7study.local`.
2. Mo dashboard giao vien.
3. Kiem tra lop CS50W.
4. Mo lop.
5. Xem tab bai hoc.
6. Mo text/video/file/quiz.
7. Xem tab tai nguyen.
8. Kiem tra pending students.
9. Tao discussion message.
10. Xem assignment/submission.

Luong sinh vien:

1. Login mot SV active.
2. Mo dashboard sinh vien.
3. Mo lop CS50W.
4. Xem bai hoc.
5. Danh dau bai hoc da hoc.
6. Lam quiz.
7. Gui discussion message.
8. Nop assignment.

Luong pending/rejected:

1. Login SV pending.
2. Kiem tra viec chua co quyen vao lop active.
3. Login GV.
4. Kiem tra pending list.
5. Duyet mot request neu can demo.

## 10. Ket qua dat duoc

He thong da dat duoc cac ket qua chinh:

- Co ung dung fullstack chay duoc local.
- Co phan quyen theo role.
- Co luong lop hoc va bai hoc kha day du.
- Co upload tai nguyen qua Supabase.
- Co quiz, assignment, discussion.
- Co seed data thuc te phu hop demo.
- Co README huong dan cai dat, test va seed.

## 11. Han che

Mot so han che trong pham vi MVP:

- Chua co realtime notification.
- Discussion da ho tro chat realtime qua WebSocket/socket.io.
- Chua co phan tich hoc tap nang cao.
- Chua co import/export danh sach sinh vien.
- Chua co dashboard thong ke sau cho admin.
- Chua hoan thien toan bo luong email trong demo local.
- Bao mat da co JWT va role guard, nhung chua audit sau theo chuan production.

## 12. Huong phat trien

Co the mo rong he thong theo cac huong:

- Them realtime notification bang WebSocket.
- Them analytics cho tien do va diem so sinh vien.
- Them lich hoc va nhac deadline.
- Them rubric cham diem assignment.
- Them import sinh vien bang CSV.
- Them export diem/tien do.
- Them search/filter tai nguyen va bai hoc.
- Cai thien UI mobile.
- Them test tu dong cho cac luong quan trong.

## 13. Ket luan

Du an 7Study LMS da xay dung duoc mot he thong quan ly hoc tap truc tuyen o muc MVP, co kha nang demo cac luong nghiep vu chinh cua Admin, Giao vien va Sinh vien. He thong su dung kien truc fullstack voi React, NestJS, PostgreSQL va Supabase Storage. Bo du lieu CS50W giup minh hoa luong hoc tap thuc te, tu bai hoc, tai nguyen, quiz, discussion den assignment.

Trong pham vi mon hoc, du an dap ung muc tieu xay dung mot san pham co the chay, co du lieu demo va co cau truc de tiep tuc mo rong.
