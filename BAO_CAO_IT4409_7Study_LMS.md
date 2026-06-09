# BÁO CÁO ĐỒ ÁN MÔN HỌC
## IT4409 – Công nghệ Web và Dịch vụ Trực tuyến
### Hệ thống Quản lý Học tập 7Study LMS

---

**Giảng viên hướng dẫn:** *(điền tên giảng viên)*
**Học kỳ:** 2025.2 – Năm học 2025–2026

| STT | Họ và tên | MSSV | Vai trò |
|-----|-----------|------|---------|
| 1 | Trần Đức Thái | *(điền MSSV)* | Trưởng nhóm – Backend & Tích hợp |
| 2 | Nguyễn Khánh Sơn | *(điền MSSV)* | Frontend & Triển khai |
| 3 | Nguyễn Mai Thành Sơn | *(điền MSSV)* | Frontend – UI ban đầu |

**Link GitHub mã nguồn:** https://github.com/tranducthai/IT4409

---

## 1. MÔ TẢ BÀI TOÁN

### 1.1. Bối cảnh và Đặt vấn đề

Trong môi trường giáo dục hiện đại, nhu cầu về một nền tảng học trực tuyến ngày càng cao. Các nền tảng hiện có (Moodle, Canvas, Google Classroom) thường phức tạp và khó triển khai cho các lớp học quy mô nhỏ. Nhóm đề xuất xây dựng **7Study LMS** – một hệ thống quản lý học tập (Learning Management System) đầy đủ chức năng, gọn nhẹ, dễ triển khai, hướng đến các lớp học đại học quy mô vừa.

### 1.2. Mục tiêu

- Xây dựng nền tảng học trực tuyến hỗ trợ đầy đủ luồng dạy-học của **3 vai trò**: Admin, Giáo viên, Sinh viên.
- Triển khai được lên môi trường **cloud** với chi phí thấp (Render + Neon + Supabase).
- Giao diện thân thiện, hỗ trợ **dark mode** và **responsive** trên thiết bị di động.
- Tích hợp các chức năng nâng cao: **chat thời gian thực** (WebSocket), **nhập đề quiz từ CSV**, **thông báo (notification)**, **upload file lên cloud**.

### 1.3. Phạm vi hệ thống

Hệ thống bao gồm các luồng nghiệp vụ chính:

| Vai trò | Chức năng chính |
|---------|----------------|
| **Admin** | Xem thống kê hệ thống, quản lý danh sách người dùng và lớp học |
| **Giáo viên** | Tạo và quản lý lớp học, bài học, tài nguyên, quiz, bài tập, thảo luận, chấm điểm |
| **Sinh viên** | Tham gia lớp, học bài, làm quiz, nộp bài, theo dõi tiến độ, trao đổi thảo luận |

---

## 2. CÔNG NGHỆ SỬ DỤNG

> **[Tiêu chí 4 – Công nghệ phức tạp, đáp ứng bài toán: 10đ]**

### 2.1. Tổng quan Stack

| Thành phần | Công nghệ | Lý do chọn |
|------------|-----------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS | SPA hiện đại, HMR nhanh, utility-first CSS |
| **Backend** | NestJS, TypeScript | Module hóa rõ ràng, DI, Guard, Decorator |
| **Database** | PostgreSQL / Neon (serverless) | Quan hệ có cấu trúc, hỗ trợ migration |
| **ORM** | TypeORM | Tự động sync schema, quản lý migration |
| **Auth** | JWT access token + refresh token | Stateless, bảo mật, tự động renew session |
| **File Storage** | Supabase Storage | CDN toàn cầu, miễn phí cho MVP |
| **Realtime** | WebSocket (socket.io / NestJS Gateway) | Chat thảo luận thời gian thực |
| **API docs** | Swagger (OpenAPI) | Tự sinh từ decorator NestJS |
| **Email** | Nodemailer / SMTP Gmail | Reset mật khẩu, thông báo |
| **Triển khai** | Render (backend), Neon (DB) | CI/CD tự động, serverless, miễn phí |

### 2.2. Điểm kỹ thuật nổi bật

1. **JWT dual-token (access + refresh):** Access token ngắn hạn (15 phút), refresh token dài hạn. Frontend tự động làm mới token khi hết hạn (interceptor trong `client.js`).

2. **WebSocket realtime chat:** Sử dụng NestJS WebSocket Gateway tích hợp socket.io. Sinh viên và giáo viên nhắn tin thời gian thực trong Discussion mà không cần reload trang.

3. **Upload file cloud (Supabase Storage):** File bài tập, tài nguyên lớp, avatar được upload trực tiếp lên Supabase bucket. Database chỉ lưu URL, không lưu binary – giảm tải DB.

4. **CSV import quiz:** Giáo viên có thể nhập hàng loạt câu hỏi từ file `.csv` thay vì nhập từng câu – tiết kiệm thời gian khi có bộ đề lớn.

5. **Notification system:** Hệ thống thông báo in-app với realtime updates khi có sinh viên mới xin vào lớp, có bài nộp mới, hoặc có tin nhắn mới.

6. **Seed data thực tế CS50W:** Toàn bộ khóa học CS50W (Harvard) được seed tự động: 26 bài học, 5 quiz, 12 tài nguyên, assignment, discussion – phục vụ demo end-to-end.

---

## 3. THIẾT KẾ HỆ THỐNG

### 3.1. Kiến trúc tổng quan

```
┌──────────────────────────────────────┐
│          BROWSER (React + Vite)      │
│  React Router / Tailwind CSS         │
│  JWT localStorage / WS Client        │
└───────────────┬──────────────────────┘
                │ REST API (HTTP/JSON) + WebSocket
                ▼
┌──────────────────────────────────────┐
│        BACKEND (NestJS / Node.js)    │
│  Controllers → Services → TypeORM   │
│  Auth Guard / Role Guard             │
│  WebSocket Gateway (socket.io)       │
└──────────┬─────────────┬─────────────┘
           │ TypeORM     │ Supabase SDK
           ▼             ▼
┌──────────────┐   ┌──────────────────┐
│  PostgreSQL  │   │  Supabase Storage│
│  (Neon)      │   │  (Files/Avatars) │
└──────────────┘   └──────────────────┘
```

### 3.2. Cấu trúc thư mục Backend (16 module)

```
backend/src/modules/
├── auth/               # Đăng nhập, JWT, refresh token, reset password
├── users/              # CRUD người dùng, avatar upload
├── classes/            # CRUD lớp học, avatar lớp
├── class-members/      # Quản lý thành viên, duyệt/từ chối
├── sections/           # Chương/tuần học
├── lessons/            # Bài học (text/video/file/quiz)
├── lesson-progress/    # Theo dõi tiến độ học
├── class-resources/    # Tài nguyên lớp (folder + file)
├── quizzes/            # Thông tin quiz, import CSV
├── questions/          # Câu hỏi trắc nghiệm
├── quiz-attempts/      # Lần làm bài của sinh viên
├── quiz-answers/       # Đáp án từng câu
├── assignments/        # Bài tập có deadline
├── submissions/        # Bài nộp + chấm điểm
├── discussions/        # Chủ đề thảo luận
├── messages/           # Tin nhắn (REST + WS)
├── notifications/      # Thông báo in-app
└── chat/               # WebSocket Gateway
```

### 3.3. Cơ sở dữ liệu (ERD tóm tắt)

Hệ thống có **20+ bảng** với các quan hệ:

```
users ──< class_members >── classes
classes ──< sections ──< lessons
lessons ──< lesson_progresses (users)
classes ──< quizzes ──< questions
quizzes ──< quiz_attempts ──< quiz_answers
classes ──< assignments ──< assignment_submissions
classes ──< discussions ──< messages
classes ──< class_resource_folders ──< class_resources
users ──< notifications
```

---

## 4. CHỨC NĂNG HỆ THỐNG (Backend API)

> **[Tiêu chí 3 – Chức năng đa dạng, đáp ứng bài toán: 20đ]**

### 4.1. Module Xác thực (Auth)

| Endpoint | Mô tả |
|----------|-------|
| `POST /api/auth/register` | Đăng ký tài khoản |
| `POST /api/auth/login` | Đăng nhập, nhận access + refresh token |
| `POST /api/auth/refresh` | Làm mới access token |
| `GET  /api/auth/me` | Lấy thông tin người dùng hiện tại |
| `PATCH /api/auth/change-password` | Đổi mật khẩu |
| `POST /api/auth/forgot-password` | Gửi email reset mật khẩu |
| `POST /api/auth/reset-password` | Đặt lại mật khẩu qua token email |

### 4.2. Module Lớp học & Thành viên

| Endpoint | Mô tả |
|----------|-------|
| `GET/POST /api/classes` | Danh sách / tạo lớp học |
| `PATCH/DELETE /api/classes/:id` | Sửa / xóa lớp học |
| `POST /api/classes/:id/avatar` | Upload ảnh đại diện lớp |
| `GET /api/class-members/me/teacher-classes` | Lớp của giáo viên |
| `GET /api/class-members/me/student-classes` | Lớp đã tham gia (sinh viên) |
| `POST /api/class-members/me/request-join` | Gửi yêu cầu tham gia bằng join code |
| `PATCH /api/class-members/:id/approve` | Giáo viên duyệt sinh viên |
| `PATCH /api/class-members/:id/reject` | Giáo viên từ chối sinh viên |
| `GET /api/class-members/classes/:id/pending` | Danh sách sinh viên chờ duyệt |

### 4.3. Module Bài học

| Endpoint | Mô tả |
|----------|-------|
| `GET/POST /api/sections/class/:classId` | Section (chương học) |
| `GET/POST/PATCH/DELETE /api/lessons` | CRUD bài học |
| `POST /api/lessons/:id/progress/me` | Đánh dấu đã học |
| `GET /api/lessons/class/:classId/progress` | Xem tiến độ tổng lớp |

Bài học hỗ trợ 4 loại nội dung: `text`, `video` (YouTube), `file` (Supabase), `quiz`.

### 4.4. Module Quiz

| Endpoint | Mô tả |
|----------|-------|
| `GET/POST /api/quizzes` | Quản lý quiz |
| `POST /api/quizzes/:id/import-csv` | **Import câu hỏi từ CSV** |
| `POST /api/quiz/:id/start` | Bắt đầu làm bài (tạo attempt) |
| `POST /api/quiz/:id/submit` | Nộp bài, tính điểm tự động |
| `GET /api/quiz/:id/attempts/me` | Xem lịch sử làm bài |

### 4.5. Module Bài tập & Nộp bài

| Endpoint | Mô tả |
|----------|-------|
| `GET/POST /api/assignments/class/:classId` | Danh sách / tạo bài tập |
| `POST /api/submissions/assignment/:id` | Sinh viên nộp bài (có upload file) |
| `GET /api/submissions/assignment/:id` | Giáo viên xem tất cả bài nộp |
| `PATCH /api/submissions/:id/grade` | Chấm điểm và phản hồi |

### 4.6. Module Thảo luận & Chat Realtime

| Endpoint / Event | Mô tả |
|-----------------|-------|
| `GET/POST /api/discussions/class/:classId` | Quản lý chủ đề thảo luận |
| `GET/POST /api/messages/discussion/:id` | Tin nhắn REST |
| WS `join-discussion` | Tham gia phòng chat |
| WS `send-message` | Gửi tin nhắn realtime |
| WS `new-message` | Nhận tin nhắn realtime |

### 4.7. Module Tài nguyên Lớp

Upload tài liệu (PDF, ZIP, DOC...) lên Supabase với hệ thống thư mục:

```
GET  /api/class-resources/class/:classId/folders   # Danh sách thư mục
POST /api/class-resources/class/:classId/folders   # Tạo thư mục
POST /api/class-resources/class/:classId/upload    # Upload file
DELETE /api/class-resources/:resourceId            # Xóa file
```

### 4.8. Module Thông báo (Notification)

Hệ thống thông báo in-app với realtime updates:
- Thông báo khi có sinh viên mới xin vào lớp
- Thông báo khi có bài nộp mới
- Thông báo khi có tin nhắn mới trong discussion

---

## 5. GIAO DIỆN NGƯỜI DÙNG (Frontend)

> **[Tiêu chí 1 – Giao diện đẹp: 15đ | Tiêu chí 2 – Responsive mobile: 5đ]**

### 5.1. Thiết kế giao diện

**Công nghệ:** React 18 + Vite + Tailwind CSS
- **Dark mode:** Hệ thống hỗ trợ giao diện sáng/tối, người dùng có thể chuyển đổi.
- **Component-based:** Mỗi tính năng là một component độc lập, dễ tái sử dụng.
- **Responsive:** Layout tự điều chỉnh với các breakpoint `sm/md/lg/xl` của Tailwind CSS.
- **Loading states & Error handling:** Mọi lệnh gọi API đều có trạng thái loading và thông báo lỗi rõ ràng.

### 5.2. Các màn hình chính

| Trang | Route | Chức năng |
|-------|-------|-----------|
| Trang chủ | `/` | Giới thiệu hệ thống |
| Đăng nhập | `/login` | Xác thực, redirect theo role |
| Đăng ký | `/register` | Tạo tài khoản mới |
| Admin Dashboard | `/dashboard/admin` | Thống kê users/lớp toàn hệ thống |
| Teacher Dashboard | `/dashboard/teacher` | Quản lý lớp, duyệt sinh viên |
| Student Dashboard | `/dashboard/student` | Lớp đã tham gia, nhập join code |
| Chi tiết lớp | `/courses/:id` | Bài học / BTVN / Tài nguyên / Tiến độ / Thảo luận |
| Làm quiz | `/courses/:id/quizzes/:qid` | Giao diện làm bài có đồng hồ đếm ngược |
| Hồ sơ | `/profile` | Thông tin cá nhân, upload avatar |

### 5.3. Tính năng responsive (Mobile)

*(Đây là nơi chèn ảnh chụp màn hình trên điện thoại/tablet)*

- Navigation collapse thành hamburger menu trên mobile.
- Grid bài học chuyển từ 3 cột (desktop) xuống 1 cột (mobile).
- Form nhập liệu và bảng dữ liệu có scroll ngang trên màn hình nhỏ.
- Đã fix responsive layout trong commit: `Fix responsive layout and document admin account` (08/06/2026).

### 5.4. Route Guard & Bảo mật Frontend

```
RequireAuth     → bắt buộc có token, redirect về /login nếu chưa đăng nhập
RequireGuest    → nếu đã đăng nhập không vào login/register
RequireRole     → chỉ cho vai trò phù hợp vào route (admin/teacher/student)
DashboardRoute  → đọc role từ localStorage, redirect đến dashboard tương ứng
```

---

## 6. TRIỂN KHAI ONLINE

> **[Tiêu chí 5 – Triển khai online: 5đ]**

Hệ thống được triển khai trên nền tảng cloud:

| Thành phần | Nền tảng | Ghi chú |
|------------|----------|---------|
| **Backend API** | Render.com | Auto-deploy từ GitHub branch `main` |
| **Database** | Neon (PostgreSQL serverless) | Connection string với SSL mode |
| **File Storage** | Supabase Storage | Bucket `uploads` + `cs50w-resources` |
| **Frontend** | *(Vercel / Netlify / Render Static)* | Build từ `npm run build` |

**Cấu hình triển khai:**
- Backend đọc cấu hình từ biến môi trường (`.env`), không commit secret.
- Migration chạy tự động khi deploy: `npm run migration:run`.
- Frontend build sẵn bundle tĩnh, không phụ thuộc Node.js runtime.

*(Chèn ảnh chụp trang web đang chạy online tại đây)*

---

## 7. KẾT QUẢ ĐẠT ĐƯỢC

### 7.1. Tổng hợp chức năng đã hoàn thiện

| STT | Tính năng | Trạng thái |
|-----|-----------|------------|
| 1 | Đăng ký / đăng nhập / đổi mật khẩu | ✅ Hoàn thành |
| 2 | Quên mật khẩu qua email | ✅ Hoàn thành |
| 3 | Phân quyền 3 vai trò (Admin/Teacher/Student) | ✅ Hoàn thành |
| 4 | Tạo/sửa/xóa lớp học + ảnh đại diện lớp | ✅ Hoàn thành |
| 5 | Tham gia lớp bằng join code | ✅ Hoàn thành |
| 6 | Duyệt/từ chối sinh viên vào lớp | ✅ Hoàn thành |
| 7 | Quản lý bài học (text/video/file/quiz) | ✅ Hoàn thành |
| 8 | Theo dõi tiến độ học của sinh viên | ✅ Hoàn thành |
| 9 | Tạo quiz + chấm điểm tự động | ✅ Hoàn thành |
| 10 | Import câu hỏi quiz từ file CSV | ✅ Hoàn thành |
| 11 | Tạo bài tập + nộp bài có file đính kèm | ✅ Hoàn thành |
| 12 | Chấm điểm bài tập + phản hồi | ✅ Hoàn thành |
| 13 | Upload tài nguyên lớp (PDF/ZIP) lên Supabase | ✅ Hoàn thành |
| 14 | Quản lý tài nguyên theo thư mục | ✅ Hoàn thành |
| 15 | Thảo luận trong lớp | ✅ Hoàn thành |
| 16 | **Chat realtime (WebSocket)** | ✅ Hoàn thành |
| 17 | **Hệ thống thông báo in-app** | ✅ Hoàn thành |
| 18 | Upload avatar người dùng | ✅ Hoàn thành |
| 19 | Admin dashboard (thống kê tổng quan) | ✅ Hoàn thành |
| 20 | Dark mode | ✅ Hoàn thành |
| 21 | Responsive mobile | ✅ Hoàn thành |
| 22 | Triển khai online (Render + Neon) | ✅ Hoàn thành |
| 23 | Seed data CS50W để demo end-to-end | ✅ Hoàn thành |

### 7.2. Swagger API Documentation

*(Chèn ảnh chụp màn hình Swagger UI tại đây)*

Toàn bộ API có tài liệu Swagger tự động tại `/api/docs`, bao gồm mô tả endpoint, schema request/response và thử nghiệm trực tiếp.

---

## 8. TỔ CHỨC NHÓM VÀ PHÂN CÔNG CÔNG VIỆC

> **[Tiêu chí 8 – Phân công đồng đều, có công cụ quản lý: 10đ]**
> **[Tiêu chí 9 – Mọi thành viên commit hàng tuần từ tuần 7: 15đ]**

### 8.1. Công cụ quản lý tiến độ

Nhóm sử dụng **GitHub** làm công cụ quản lý tiến độ chính:
- **GitHub Issues:** Theo dõi task và bug.
- **GitHub Pull Requests (19 PRs):** Mỗi tính năng lớn được code trên nhánh riêng và merge qua PR review.
- **Branch strategy:** `main` (production) ← `dev` ← `feat/*`, `fix/*`

*(Chèn ảnh chụp màn hình GitHub Insights / Contributions graph tại đây)*

### 8.2. Phân công công việc

| Thành viên | Vai trò | Phần việc chính |
|------------|---------|----------------|
| **Trần Đức Thái** | Backend Lead | Thiết kế DB, tất cả module backend (auth, classes, lessons, quiz, assignment, submission, discussion, notifications), WebSocket chat, CSV import quiz, avatar upload, tích hợp API frontend |
| **Nguyễn Khánh Sơn** | Frontend Lead | Toàn bộ giao diện React, route guards, dark mode, dashboard 3 vai trò, trang chi tiết lớp/quiz, seed data CS50W, cấu hình triển khai Render, realtime chat frontend |
| **Nguyễn Mai Thành Sơn** | Frontend | Giao diện Dashboard ban đầu, trang Home UI, hỗ trợ UI component giai đoạn đầu |

### 8.3. Lịch sử commit theo tuần

*(Chèn ảnh chụp Insights → Contributors từ GitHub repository tại đây)*

Bảng thống kê commit theo tuần (từ tuần 7 của học kỳ trở đi):

| Tuần | Thời gian | Trần Đức Thái | Nguyễn Khánh Sơn | Nguyễn Mai Thành Sơn |
|------|-----------|:---:|:---:|:---:|
| Tuần 1 | 30/3 – 5/4 | - | 2 commits | - |
| Tuần 2 | 6/4 – 12/4 | 3 commits | 3 commits | 2 commits |
| Tuần 3 | 13/4 – 19/4 | 6 commits | 1 commit | 1 commit |
| Tuần 4 | 20/4 – 26/4 | 2 commits | 4 commits | - |
| Tuần 5 | 27/4 – 3/5 | 2 commits | 1 commit | - |
| Tuần 6 | 4/5 – 10/5 | - | 4 commits | - |
| **Tuần 7** | **11/5 – 17/5** | **1 commit** | **4 commits** | - |
| **Tuần 8** | **18/5 – 24/5** | **2 commits** | **12 commits** | - |
| **Tuần 9** | **25/5 – 31/5** | **7 commits** | **4 commits** | - |
| **Tuần 10** | **1/6 – 7/6** | **7 commits** | **10 commits** | - |
| **Tuần 11** | **8/6 – 14/6** | **2 commits** | **4 commits** | - |
| **Tổng** | | **36 commits** | **58 commits** | **3 commits** |

> **Lưu ý:** Từ tuần 7 đến nay, cả Trần Đức Thái và Nguyễn Khánh Sơn đều commit đều đặn mỗi tuần.

### 8.4. Ảnh chụp đóng góp mã nguồn từng thành viên

> **[BẮT BUỘC – Chèn ảnh vào đây]**

**Hướng dẫn lấy ảnh:**
1. Vào https://github.com/tranducthai/IT4409/graphs/contributors
2. Chụp màn hình biểu đồ contributions của từng thành viên.
3. Hoặc vào tab `Insights → Contributors` để thấy commit count và additions/deletions.

---

**(Vị trí chèn ảnh 1: Contribution graph của Trần Đức Thái)**

---

**(Vị trí chèn ảnh 2: Contribution graph của Nguyễn Khánh Sơn)**

---

**(Vị trí chèn ảnh 3: Contribution graph của Nguyễn Mai Thành Sơn)**

---

## 9. HƯỚNG DẪN SỬ DỤNG & DEMO

### 9.1. Tài khoản demo (Seed CS50W)

| Vai trò | Email | Mật khẩu |
|---------|-------|---------|
| Admin | `demo.admin@7study.local` | `Password123!` |
| Giáo viên | `teacher.cs50w@7study.local` | `Password123!` |
| Sinh viên (active) | `student.cs50w@7study.local` | `Password123!` |
| Sinh viên (chờ duyệt) | `student.pending1.cs50w@7study.local` | `Password123!` |

**Join code lớp CS50W:** `CS50W-2026`

### 9.2. Kịch bản demo nhanh

**Giáo viên:**
1. Đăng nhập → Dashboard → Mở lớp CS50W
2. Xem danh sách bài học (text/video/quiz)
3. Xem sinh viên đang chờ duyệt → Duyệt vào lớp
4. Xem bài nộp của sinh viên → Chấm điểm
5. Tạo thảo luận, gửi tin nhắn realtime

**Sinh viên:**
1. Đăng nhập → Dashboard → Vào lớp
2. Học bài → Đánh dấu đã học
3. Làm quiz → Xem kết quả ngay
4. Nộp bài tập (upload file)
5. Nhắn tin trong discussion realtime

---

## 10. KẾT LUẬN

### 10.1. Kết quả đạt được

Nhóm đã hoàn thiện sản phẩm **7Study LMS** với đầy đủ tính năng của một Learning Management System hoàn chỉnh:
- **23 tính năng** đã hoàn thiện, bao gồm các tính năng nâng cao như chat realtime, notification, import CSV.
- **Giao diện** thân thiện, hỗ trợ dark mode và responsive mobile.
- **Triển khai online** trên Render + Neon với CI/CD từ GitHub.
- **Mã nguồn** được quản lý chuyên nghiệp qua 19 Pull Requests, mỗi tính năng trên nhánh riêng.

### 10.2. Hạn chế

- Chưa có phân tích học tập nâng cao (biểu đồ tiến độ chi tiết).
- Chưa có import/export danh sách sinh viên hàng loạt (CSV).
- Chưa có lịch học và nhắc deadline.
- Chưa kiểm thử tự động (unit test) cho frontend.

### 10.3. Hướng phát triển

- Thêm analytics dashboard cho giáo viên (biểu đồ điểm, tiến độ).
- Thêm push notification (email/browser).
- Thêm rubric chấm điểm assignment.
- Thêm video call tích hợp (Jitsi/Daily.co).

---

## PHỤ LỤC: LINK VÀ TÀI NGUYÊN

| Tài nguyên | Link |
|------------|------|
| **GitHub mã nguồn** | https://github.com/tranducthai/IT4409|
| **Swagger API docs** | `[URL_DEPLOY]/api/docs` |
| **App online** | *(chèn link deploy)* |

---

*Báo cáo được soạn theo tiêu chí đánh giá môn IT4409 – Công nghệ Web và Dịch vụ Trực tuyến.*
*Tổng số trang: ~14 trang (tùy font, margin trong Word)*
