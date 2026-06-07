# IT4409 - Learning Management System

Repo gom 2 ung dung:

- `backend`: NestJS API, TypeORM, PostgreSQL/Neon, JWT auth, Supabase Storage.
- `frontend`: React + Vite, co 2 che do API that va mock data.

Video bai hoc nen luu bang YouTube URL/embed. File nho, tai nguyen lop, tep bai tap va tep nop bai duoc upload len Supabase Storage.

## 1. Yeu cau moi truong

- Node.js >= 20
- npm >= 10
- PostgreSQL/Neon database
- Supabase project + Storage bucket

## 2. Cai dat

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 3. Cau hinh moi truong

### Backend

Tao file `backend/.env` tu mau:

```bash
cd backend
cp .env.example .env
```

Cac bien quan trong:

```env
PORT=8000
HOST=127.0.0.1
DATABASE_URL=postgresql://...
PG_SSL=true
JWT_SECRET=change_me
JWT_EXPIRES_IN=15m

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app_password
SMTP_FROM=your@gmail.com
APP_BASE_URL=http://127.0.0.1:8000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_BUCKET=uploads
```

Ghi chu:

- `JWT_SECRET` doi se lam token cu het hieu luc, nhung khong doi du lieu DB.
- `SUPABASE_SERVICE_KEY` la secret, chi de o backend `.env`.
- Neu dung Neon va thay warning SSL mode, co the doi connection string sang `sslmode=verify-full`.

### Frontend

Tao file `frontend/.env` tu mau:

```bash
cd frontend
cp .env.example .env
```

De test API that:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_USE_MOCK_DATA=false
VITE_MOCK_SESSION_ROLE=STUDENT
```

De test UI doc lap bang mock:

```env
VITE_USE_MOCK_DATA=true
VITE_MOCK_SESSION_ROLE=STUDENT
```

`VITE_MOCK_SESSION_ROLE` chi co tac dung khi `VITE_USE_MOCK_DATA=true`.

## 4. Database migration

Chay migration:

```bash
cd backend
npm run migration:run
```

Kiem tra trang thai migration:

```bash
npm run migration:show
```

Cac migration MVP can thay `[X]`:

- `AddAssignmentAttachmentsAndSubmissionFiles1777000000000`
- `AddLessonProgress1778000000000`
- `AddClassResourceFolders1778100000000`

## 5. Chay ung dung

Terminal 1:

```bash
cd backend
npm run start:dev
```

Swagger:

```text
http://127.0.0.1:8000/api/docs
```

Terminal 2:

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend:

```text
http://localhost:5173
```

## 6. Lenh test

Backend:

```bash
cd backend
npm run build
npm test
npm run test:e2e
npm run migration:show
npm audit --omit=dev
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
VITE_API_BASE_URL=http://127.0.0.1:8000/api npm run test:p1
npm audit --omit=dev
```

`test:p1` yeu cau backend dang chay va co demo account trong DB.

## 7. Du lieu test CS50W

Repo co seed that cho khoa `CS50's Web Programming with Python and JavaScript`.
File mo ta seed nam o:

```text
cs50w_seed_course.yaml
```

Chay seed:

```bash
cd backend
npm run seed:cs50w
```

Seed nay tao lop, GV, nhieu SV, bai hoc, YouTube video, PDF/ZIP tai nguyen, quiz,
discussion, assignment va submission mau.

Tai nguyen da tai ve local nam o:

```text
/tmp/cs50w_resources
```

Khi chay seed, cac file CS50W local se duoc upload len Supabase bucket
`cs50w-resources`; app se dung URL cloud sau khi upload.

Thong tin lop:

| Truong | Gia tri |
| --- | --- |
| Ten lop | `CS50's Web Programming with Python and JavaScript` |
| Join code | `CS50W-2026` |

Account test, password chung la `Password123!`:

| Case | Email |
| --- | --- |
| Giao vien | `teacher.cs50w@7study.local` |
| SV active chinh | `student.cs50w@7study.local` |
| SV active frontend | `student.frontend.cs50w@7study.local` |
| SV active backend | `student.backend.cs50w@7study.local` |
| SV active QA | `student.qa.cs50w@7study.local` |
| SV active fullstack | `student.fullstack.cs50w@7study.local` |
| SV dang cho duyet | `student.pending1.cs50w@7study.local` |
| SV dang cho duyet | `student.pending2.cs50w@7study.local` |
| SV bi tu choi | `student.rejected.cs50w@7study.local` |

Luon test nhanh:

1. Login GV, mo lop CS50W.
2. Vao tab bai hoc, mo YouTube/PDF, xem text inline va lam quiz.
3. Vao dashboard GV de xem case SV dang cho duyet.
4. Login SV active, vao lop, danh dau da hoc, lam quiz, gui discussion va nop assignment.
5. Login SV pending/rejected de kiem tra case chua co quyen vao lop active.

## 8. Schema du lieu that cho 1 luong demo

Nen chuan bi toi thieu 1 giao vien, 1 sinh vien va 1 lop hoc co du noi dung de demo.

### Users

| Vai tro | Truong can co |
| --- | --- |
| Admin | `full_name`, `email`, `password`, `role=ADMIN` |
| Giao vien | `full_name`, `email`, `password`, `role=TEACHER` |
| Sinh vien | `full_name`, `email`, `password`, `role=STUDENT` |

### Class

| Truong | Goi y |
| --- | --- |
| `name` | Ten mon hoc that |
| `description` | Mo ta ngan ve mon |
| `avatar_url` | Anh dai dien mon hoc |
| `type` | `OPEN` hoac `CLOSED` |
| `teacher_id` | ID cua giao vien |
| `join_code` | Ma vao lop, vi du `IT4409-01` |
| `is_active` | `true` |

### Class members

| User | Role | Status |
| --- | --- | --- |
| Giao vien | `TEACHER` | `ACTIVE` |
| Sinh vien | `STUDENT` | `ACTIVE` |

### Sections va lessons

Nen co 2-3 section, moi section 1-3 lesson:

| Muc | Truong can co |
| --- | --- |
| Section | `class_id`, `title`, `order_index` |
| Lesson | `section_id`, `title`, `description`, `order_index` |

### Lesson contents

Nen co du cac loai sau:

| Loai | Cach dien |
| --- | --- |
| Text | `type=text`, `title`, `content` |
| YouTube video | `type=video`, `title`, `file_url` la YouTube URL/embed URL |
| File tai lieu | Upload len Supabase qua UI/API, luu URL vao `file_url` |
| Quiz link | Tao quiz gan voi lop/bai hoc neu can demo lam bai |

### Quiz

Can toi thieu:

- 1 quiz gan voi class.
- 3-5 cau hoi.
- Moi cau hoi co dap an dung.
- Sinh vien lam bai 1 lan de co attempt/result.

### Tai nguyen lop

Can toi thieu:

- 1 folder tai nguyen.
- 1 file PDF/doc/link nho upload len Supabase.

### Discussion

Can toi thieu:

- 1 discussion trong lop.
- 1 message tu giao vien.
- 1 message tu sinh vien.

### Assignment va submission

Neu demo bai tap:

- 1 assignment co deadline.
- 1 attachment cua giao vien neu co.
- 1 submission cua sinh vien, co file nop bai.
- 1 lan cham diem/feedback neu can demo flow day du.

## 9. Checklist demo nhanh

1. Login giao vien.
2. Vao dashboard, mo lop hoc.
3. Kiem tra danh sach bai hoc, them/sua noi dung neu can.
4. Mo YouTube video trong bai hoc.
5. Upload tai nguyen lop len Supabase.
6. Tao/kiem tra quiz.
7. Login sinh vien.
8. Vao lop, hoc bai, danh dau tien do.
9. Lam quiz va xem ket qua.
10. Gui discussion message.
11. Nop assignment neu demo bai tap.

## 10. Luu y hien tai

- `.env` da duoc ignore; chi commit `.env.example`.
- Frontend chi dung mock role khi `VITE_USE_MOCK_DATA=true`.
- Backend e2e co the in warning open handle sau khi pass.
- `npm audit --omit=dev` hien co canh bao moderate o frontend `postcss` va backend `qs`.
