# On tap bao ve du an - 7Study LMS

> Muc tieu cua file nay la giup nam du de tra loi khi bi hoi: "chuc nang nay lam gi?", "du lieu nam dau?", "API nao xu ly?", "tai sao thiet ke nhu vay?". Khong can hoc tung dong code, can nam dung luong va diem neo ky thuat.

## 1. Tom tat trong 1 phut

7Study la he thong LMS thu gon. He thong co 3 vai tro:

- Admin quan ly tong quan.
- Giao vien quan ly lop, bai hoc, tai nguyen, quiz, assignment va discussion.
- Sinh vien tham gia lop, hoc bai, lam quiz, nop bai va trao doi.

Frontend viet bang React + Vite. Backend viet bang NestJS. Database la PostgreSQL/Neon. File nho upload len Supabase Storage. Dang nhap dung JWT access token va refresh token.

Khi demo, du lieu chinh la khoa CS50W. Video dung YouTube URL, PDF/ZIP duoc upload len Supabase, text hien inline trong lesson.

## 2. Ban do code can nho

### 2.1. Frontend

| File/thu muc | De lam gi |
| --- | --- |
| `frontend/src/App.jsx` | Khai bao route chinh |
| `frontend/src/components/RouteGuards.jsx` | Bao ve route theo login/role |
| `frontend/src/pages/login.jsx` | Dang nhap va redirect theo role |
| `frontend/src/pages/Dashboard.jsx` | Chon dashboard theo role |
| `frontend/src/pages/dashboard/AdminDashboard.jsx` | UI admin |
| `frontend/src/pages/dashboard/TeacherDashboard.jsx` | UI giao vien |
| `frontend/src/pages/dashboard/StudentDashboard.jsx` | UI sinh vien |
| `frontend/src/pages/CourseDetail.jsx` | Trang chi tiet lop hoc |
| `frontend/src/pages/QuizDetail.jsx` | Trang lam quiz |
| `frontend/src/services/api/client.js` | Wrapper fetch, token, refresh token |
| `frontend/src/services/api/auth.service.js` | Login/register/auth me |
| `frontend/src/services/api/course-detail.service.js` | Gom du lieu chi tiet lop tu nhieu API |
| `frontend/src/services/api/classes.service.js` | API lop va class members |
| `frontend/src/services/api/lessons.service.js` | API lesson |
| `frontend/src/services/api/class-resources.service.js` | API tai nguyen lop |

### 2.2. Backend

| Module | De lam gi |
| --- | --- |
| `auth` | Login, register, refresh token, auth me |
| `users` | CRUD user, sanitize user |
| `classes` | CRUD lop hoc |
| `class-members` | Quan ly thanh vien lop, pending/approve |
| `sections` | Quan ly section cua lop |
| `lessons` | Quan ly lesson va progress |
| `lesson-contents` | Compatibility layer cho schema lesson da merge |
| `class-resources` | Folder/file tai nguyen lop |
| `quizzes` | CRUD quiz |
| `questions` | Cau hoi quiz |
| `quiz` | Luong lam quiz |
| `quiz-attempts` | Lan lam quiz |
| `quiz-answers` | Dap an da chon |
| `assignments` | Bai tap |
| `submissions` | Bai nop va cham diem |
| `discussions` | Chu de thao luan |
| `messages` | Tin nhan thao luan |

### 2.3. Seed data

| File | De lam gi |
| --- | --- |
| `cs50w_seed_course.yaml` | Du lieu khoa CS50W dang YAML |
| `backend/src/scripts/seed-cs50w-course.ts` | Doc YAML, tao user/lop/lesson/quiz/resource/discussion/assignment |
| `/tmp/cs50w_resources` | Noi luu file PDF/ZIP CS50W da tai local |

Chay seed:

```bash
cd backend
npm run seed:cs50w
```

## 3. Luong dang nhap can nam chac

### 3.1. Dang nhap dien ra the nao?

1. User nhap email/password o `frontend/src/pages/login.jsx`.
2. Frontend clear auth state cu de tranh dung nham role cu.
3. Frontend goi `POST /api/auth/login`.
4. Backend `AuthService.login()` tim user theo email.
5. Backend dung bcrypt de so sanh password.
6. Backend tao access token va refresh token.
7. Backend tra ve token va user.
8. Frontend luu:
   - `it4409_access_token`
   - `it4409_refresh_token`
   - `it4409_current_user`
9. Frontend redirect theo role:
   - Admin -> `/dashboard/admin`
   - Giao vien -> `/dashboard/teacher`
   - Sinh vien -> `/dashboard/student`

### 3.2. Neu bi hoi tai sao co bug login nhay admin?

Tra loi:

> Vi frontend co luu current user trong localStorage. Neu truoc do dang nhap admin ma login moi khong clear state cu dung cach, route dashboard co the doc nham role cu. Sau do da sua bang cach clear auth state truoc moi lan login, bat buoc response co user/token, chuan hoa role va redirect thang theo role moi.

### 3.3. Token duoc gui len backend nhu the nao?

Trong `frontend/src/services/api/client.js`, moi request API se lay access token tu localStorage va gan header:

```text
Authorization: Bearer <access_token>
```

Neu API tra `401`, frontend thu goi refresh token. Neu refresh thanh cong thi retry request. Neu refresh fail thi clear session.

## 4. Luong dashboard theo role

### 4.1. Route `/dashboard`

`/dashboard` khong render truc tiep dashboard, ma la route trung gian:

- Doc `currentUser.role`.
- Neu `TEACHER` -> `/dashboard/teacher`.
- Neu `ADMIN` -> `/dashboard/admin`.
- Con lai -> `/dashboard/student`.

Code lien quan:

```text
frontend/src/components/RouteGuards.jsx
```

### 4.2. Dashboard page

`frontend/src/pages/Dashboard.jsx` doc `currentUser.role` roi render:

- `AdminDashboard`
- `TeacherDashboard`
- `StudentDashboard`

Neu bi hoi "tai sao chi co mot Dashboard.jsx?", tra loi:

> Dashboard.jsx la container dung chung. No doc role va chon component con phu hop. Cach nay giup route va load data tap trung, con UI tung vai tro tach rieng trong `pages/dashboard`.

## 5. Luong lop hoc

### 5.1. Bang chinh

| Bang | Vai tro |
| --- | --- |
| `classes` | Luu lop hoc |
| `class_members` | Luu ai thuoc lop nao va trang thai |
| `users` | Luu tai khoan |

### 5.2. Giao vien tao lop

1. Teacher dashboard submit form tao lop.
2. Frontend goi `POST /api/classes`.
3. Backend tao record trong `classes`.
4. Lop co `teacher_id` tro ve user giao vien.
5. Sinh vien co the xin vao bang `join_code`.

### 5.3. Sinh vien xin vao lop

1. Sinh vien nhap join code.
2. Frontend goi API request join.
3. Backend tao `class_members` voi:
   - role = `STUDENT`
   - status = `PENDING`
4. Giao vien thay request trong dashboard.
5. Giao vien approve thi status thanh `ACTIVE`.

### 5.4. Cac status can nho

| Status | Nghia |
| --- | --- |
| `ACTIVE` | Da duoc vao lop |
| `PENDING` | Dang cho giao vien duyet |
| `REJECTED` | Bi tu choi |

Neu bi hoi tai sao can `class_members`, tra loi:

> Vi mot user co the thuoc nhieu lop va moi lop co trang thai/thoi diem tham gia khac nhau. Bang `class_members` la bang trung gian giua users va classes, dong thoi luu role/status trong lop.

## 6. Luong bai hoc

### 6.1. Cau truc bai hoc

Lop hoc duoc chia:

```text
Class -> Section -> Lesson
```

Bang lien quan:

- `sections`
- `lessons`
- `lesson_progresses`

### 6.2. Lesson type

Trong schema hien tai, noi dung bai hoc nam truc tiep trong bang `lessons`.

| Type | Cach hien thi |
| --- | --- |
| `text` | Hien noi dung inline |
| `video` | Mo YouTube URL |
| `file` | Mo URL file Supabase/PDF/ZIP |
| `quiz` | Mo trang quiz |

Neu bi hoi "lesson_contents dau?", tra loi:

> Ban dau he thong co bang `lesson_contents`, sau do migration da merge cac field noi dung vao bang `lessons` de don gian hoa schema. Module `lesson-contents` con ton tai nhu compatibility layer, nhung frontend hien tai lay noi dung chinh tu `lessons`.

### 6.3. Tai sao text khong co nut Mo?

Text lesson da hien noi dung truc tiep trong card. Neu tao nut Mo cho text se khong co file/link that de mo, de gay trai nghiem sai. Vi vay UI chi hien nut Mo cho video/file/quiz.

## 7. Luong tai nguyen file

### 7.1. File duoc luu o dau?

File khong luu binary trong database. File duoc upload len Supabase Storage. Database chi luu URL va metadata.

Bang lien quan:

- `class_resource_folders`
- `class_resources`
- `assignment_attachments`
- `assignment_submission_files`

### 7.2. Tai sao video dung YouTube?

Video thuong lon, khong phu hop upload vao storage cua demo. He thong dung YouTube URL/embed de:

- Giam dung luong luu tru.
- De demo nhanh.
- Phu hop voi OpenCourseWare nhu CS50W.

### 7.3. Tai nguyen CS50W nam dau?

Local cache:

```text
/tmp/cs50w_resources
```

Trong app:

- Seed upload PDF/ZIP len Supabase bucket `cs50w-resources`.
- DB luu file URL sau khi upload.

## 8. Luong quiz

### 8.1. Bang lien quan

| Bang | Muc dich |
| --- | --- |
| `quizzes` | Quiz |
| `questions` | Cau hoi |
| `quiz_attempts` | Lan lam bai |
| `quiz_answers` | Dap an tung cau |

### 8.2. Luong lam bai

1. Sinh vien mo lesson type quiz.
2. Frontend vao `/courses/:courseId/quizzes/:quizId`.
3. Frontend lay quiz detail va questions.
4. Sinh vien chon dap an.
5. Submit len backend.
6. Backend tao attempt va answers.
7. Backend tinh diem.

### 8.3. Cau tra loi mau khi bi hoi

> Quiz duoc tach thanh quiz, questions, attempts va answers de luu ca cau hoi goc va lich su lam bai cua tung sinh vien. Nhu vay mot quiz co the co nhieu sinh vien lam, moi sinh vien co attempt rieng va dap an rieng.

## 9. Luong assignment

### 9.1. Bang lien quan

| Bang | Muc dich |
| --- | --- |
| `assignments` | Bai tap |
| `assignment_attachments` | File/link giao vien dinh kem |
| `assignment_submissions` | Bai nop cua sinh vien |
| `assignment_submission_files` | File nop bai |

### 9.2. Luong nghiep vu

1. Giao vien tao assignment.
2. Giao vien co the them attachment.
3. Sinh vien nop bai.
4. Giao vien xem submission.
5. Giao vien cham diem va feedback.

### 9.3. Diem can noi

Assignment va submission tach bang vi:

- Mot assignment co nhieu sinh vien nop.
- Moi submission co diem, feedback va file rieng.
- Giao vien can xem danh sach bai nop theo assignment.

## 10. Luong discussion

### 10.1. Bang lien quan

- `discussions`
- `messages`

### 10.2. Luong nghiep vu

1. Giao vien hoac sinh vien tao discussion.
2. Thanh vien active trong lop xem discussion.
3. Thanh vien gui message.
4. Message gan voi `user_id` de hien tac gia.

### 10.3. Han che

Discussion hien tai da co realtime chat qua WebSocket/socket.io. Frontend join room theo discussion, backend emit message moi cho cac client trong room.

## 11. Luong seed CS50W

### 11.1. Tai sao can seed?

Seed giup demo du lieu that nhanh, tranh tinh trang app chi co du lieu rong. Khoa CS50W phu hop vi co:

- Video YouTube.
- Slide PDF.
- Source ZIP.
- Noi dung lien quan CNTT.
- Cau truc bai hoc ro rang.

### 11.2. Seed script lam gi?

File:

```text
backend/src/scripts/seed-cs50w-course.ts
```

Script lam cac buoc:

1. Doc `cs50w_seed_course.yaml`.
2. Tao/update giao vien.
3. Tao/update sinh vien active, pending, rejected.
4. Tao/update class CS50W.
5. Tao memberships.
6. Tao sections va lessons.
7. Upload file local len Supabase neu co.
8. Tao class resources.
9. Tao quiz/questions.
10. Tao quiz attempts cho SV active.
11. Tao discussion/messages.
12. Tao assignment/submissions.

### 11.3. Tai sao script upsert?

Upsert nghia la chay lai nhieu lan khong tao trung du lieu qua muc. Neu record da co thi update, chua co thi create. Dieu nay giup demo/seed lai an toan hon.

## 12. Cac cau hoi hay bi hoi va cach tra loi

### Cau 1: He thong nay giai quyet van de gi?

He thong giup quan ly mot lop hoc online gom hoc lieu, tai nguyen, quiz, bai tap va thao luan. Giao vien quan ly noi dung, sinh vien hoc va nop bai, admin theo doi tong quan.

### Cau 2: Vi sao chia 3 role?

Vi moi nhom nguoi dung co quyen va workflow khac nhau:

- Admin quan ly he thong.
- Giao vien quan ly lop va noi dung.
- Sinh vien tieu thu noi dung va nop bai.

### Cau 3: File upload xu ly the nao?

Frontend gui file len backend bang multipart/form-data. Backend upload file len Supabase Storage. Supabase tra ve URL. Backend luu URL va metadata vao database.

### Cau 4: Tai sao khong luu file truc tiep trong DB?

Luu file truc tiep trong DB lam DB nang, backup kho va truy cap file kem hieu qua. Luu file tren object storage nhu Supabase la cach phu hop hon; DB chi can luu URL.

### Cau 5: Token JWT dung lam gi?

JWT dung de xac thuc request. Sau khi login, frontend gui access token trong header Authorization. Backend verify token de biet user la ai va role gi.

### Cau 6: Refresh token dung lam gi?

Access token nen co thoi gian song ngan. Refresh token giup lay access token moi ma khong bat nguoi dung login lai lien tuc.

### Cau 7: Lam sao biet sinh vien co duoc vao lop khong?

Backend kiem tra bang `class_members`. Sinh vien phai co record voi `class_id`, `user_id`, role `STUDENT` va status `ACTIVE`.

### Cau 8: Pending student hien o dau?

Trong teacher dashboard. Backend lay pending requests theo class tu bang `class_members` voi status `PENDING`.

### Cau 9: Quiz gan voi bai hoc the nao?

Lesson type `quiz` co `quiz_id`. Frontend doc `quiz_id` de dieu huong sang trang quiz tuong ung.

### Cau 10: Text lesson khac file lesson nhu the nao?

Text lesson co noi dung trong field `content` va hien inline. File lesson co `file_url` tro toi Supabase/PDF/ZIP va co nut mo file.

### Cau 11: Video lesson luu o dau?

Video lesson luu YouTube URL trong `file_url`, khong upload video len Supabase.

### Cau 12: Neu localStorage con user cu thi sao?

Truoc day co the bi redirect sai role. Hien tai trang login da clear auth state cu truoc khi login moi, sau do ghi user/token moi va redirect theo role moi.

### Cau 13: Tai sao co README va seed CS50W?

README giup nguoi khac cai dat, chay migration, seed va test. Seed CS50W giup co du lieu thuc te de demo thay vi tu tao bang tay.

### Cau 14: Diem manh cua du an?

- Co luong fullstack hoan chinh.
- Co phan quyen.
- Co upload file.
- Co quiz/assignment/discussion.
- Co seed du lieu thuc te.
- Cau truc module backend ro rang.

### Cau 15: Han che cua du an?

- Chua co realtime notification.
- Chua co analytics sau.
- Chua co import/export du lieu.
- Chua co bo test e2e day du cho tat ca flow.
- Can harden bao mat neu dua len production.

## 13. Kich ban demo 10 phut

### Buoc 1: Login giao vien

Tai khoan:

```text
teacher.cs50w@7study.local
Password123!
```

Noi:

> Day la dashboard giao vien. Giao vien quan ly cac lop minh phu trach va cac yeu cau cho duyet.

### Buoc 2: Mo lop CS50W

Noi:

> Lop nay duoc seed tu khoa CS50W, co section theo tuan, lesson gom text, video, file va quiz.

### Buoc 3: Xem bai hoc

Chi:

- Text hien inline.
- Video la YouTube URL.
- File la PDF/ZIP tren Supabase.
- Quiz dieu huong sang trang lam bai.

Noi:

> Moi lesson co type de frontend quyet dinh cach hien thi.

### Buoc 4: Xem tai nguyen

Noi:

> Tai nguyen lop duoc upload len Supabase, DB chi luu metadata va file URL.

### Buoc 5: Xem pending students

Noi:

> Sinh vien xin vao lop se co status PENDING trong class_members. Giao vien co the approve de chuyen thanh ACTIVE.

### Buoc 6: Login sinh vien active

Tai khoan:

```text
student.cs50w@7study.local
Password123!
```

Noi:

> Sinh vien chi thay cac lop da active membership.

### Buoc 7: Lam quiz

Noi:

> Khi sinh vien submit quiz, backend tao quiz attempt va quiz answers de luu lich su lam bai.

### Buoc 8: Discussion va assignment

Noi:

> Discussion giup trao doi trong lop. Assignment cho phep sinh vien nop bai va giao vien cham diem.

## 14. Cac lenh can nho

### Cai dat

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Chay migration

```bash
cd backend
npm run migration:run
```

### Chay seed CS50W

```bash
cd backend
npm run seed:cs50w
```

### Chay backend

```bash
cd backend
npm run start:dev
```

### Chay frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

### Test build

```bash
cd backend
npm run build

cd ../frontend
npm run lint
npm run build
```

### Tat server neu bi chay ngam

```bash
pkill -f "frontend/node_modules/.bin/vite"
pkill -f "backend/node_modules/.bin/nest start --watch"
```

## 15. Checklist truoc khi bao ve

- Da chay backend.
- Da chay frontend.
- `.env` frontend dung `VITE_USE_MOCK_DATA=false`.
- Backend ket noi duoc DB.
- Da seed CS50W.
- Login giao vien duoc.
- Login sinh vien active duoc.
- Mo duoc lop CS50W.
- Mo duoc video/file/quiz.
- Pending students co du lieu.
- Discussion co message.
- Assignment co submission mau.

## 16. Cach tra loi khi khong nho code

Dung cong thuc:

```text
Chuc nang nay lam gi -> Du lieu nam bang nao -> API/module nao xu ly -> Frontend hien thi o dau
```

Vi du:

> Chuc nang pending student dung de giao vien duyet sinh vien xin vao lop. Du lieu nam trong bang `class_members` voi status `PENDING`. Backend module `class-members` xu ly API lay pending va approve. Frontend hien trong teacher dashboard.

Vi du:

> Chuc nang tai nguyen lop dung de luu file hoc tap. File that nam tren Supabase Storage, database luu URL va metadata trong `class_resources`. Backend module `class-resources` xu ly upload/list/delete. Frontend hien trong tab Tai nguyen cua CourseDetail.
