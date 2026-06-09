# IT4409 Backend Database Schema

## Dieu huong nhanh

- Tong quan schema chi tiet: [docs/database_schema.md](docs/database_schema.md)
- ERD day du (1 so do lon): [docs/database_erd.md](docs/database_erd.md)
- ERD tach nho theo domain: [docs/database_erd_split.md](docs/database_erd_split.md)

Tai lieu nay mo ta schema database hien tai cua backend theo migration:
- [backend/src/migrations/1775881197833-InitSchema.ts](backend/src/migrations/1775881197833-InitSchema.ts)
- [backend/src/migrations/1775881761133-AddClassAvatarUrl.ts](backend/src/migrations/1775881761133-AddClassAvatarUrl.ts)

## 1. Tong quan

- He quan tri CSDL muc tieu: PostgreSQL.
- Tong so bang: 23.
- Kieu khoa chinh:
  - UUID cho phan lon bang nghiep vu.
  - SERIAL cho mot so bang noi dung/trac nghiem: sections, lessons, lesson_contents, answers.
- Quan ly schema bang TypeORM migration.

## 2. Enum types

1. users_role_enum: ADMIN, TEACHER, STUDENT
2. classes_type_enum: OPEN, CLOSED
3. video_participants_role_enum: HOST, PARTICIPANT
4. contents_type_enum: VIDEO, DOCUMENT, QUIZ
5. notifications_type_enum: GENERAL, ASSIGNMENT, DISCUSSION, VIDEO_SESSION
6. lesson_contents_type_enum: video, file, text, quiz
7. class_members_role_enum: TEACHER, STUDENT
8. class_members_status_enum: ACTIVE, PENDING, REJECTED

## 3. Chi tiet tung bang

### 3.1 users

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| full_name | varchar | NOT NULL | - | Ho ten |
| email | varchar | NOT NULL | - | UNIQUE |
| password | varchar | NOT NULL | - | Mat khau da hash |
| role | users_role_enum | NOT NULL | - | Vai tro user |
| avatar_url | varchar | NULL | - | Anh dai dien |
| created_at | timestamp | NOT NULL | now() | Thoi gian tao |
| updated_at | timestamp | NOT NULL | now() | Thoi gian cap nhat |

Rang buoc:
- PK: id
- UNIQUE: email

### 3.2 student_profiles

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| user_id | uuid | NOT NULL | - | FK -> users.id, one-to-one |
| student_code | varchar | NOT NULL | - | UNIQUE |
| class_name | varchar | NOT NULL | - | Lop |
| major | varchar | NOT NULL | - | Nganh |
| course_year | varchar | NOT NULL | - | Khoa |
| phone | varchar | NULL | - | So dien thoai |
| dob | date | NULL | - | Ngay sinh |

Rang buoc:
- PK: id
- UNIQUE: user_id
- UNIQUE: student_code
- FK: user_id -> users.id (ON DELETE CASCADE)

### 3.3 teacher_profiles

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| user_id | uuid | NOT NULL | - | FK -> users.id, one-to-one |
| specialization | varchar | NOT NULL | - | Chuyen mon |
| degree | varchar | NULL | - | Hoc vi |
| bio | text | NULL | - | Gioi thieu |

Rang buoc:
- PK: id
- UNIQUE: user_id
- FK: user_id -> users.id (ON DELETE CASCADE)

### 3.4 classes

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| name | varchar | NOT NULL | - | Ten lop |
| description | text | NULL | - | Mo ta |
| type | classes_type_enum | NOT NULL | - | OPEN/CLOSED |
| teacher_id | uuid | NOT NULL | - | FK -> users.id |
| join_code | varchar | NOT NULL | - | UNIQUE |
| is_active | boolean | NOT NULL | true | Trang thai |
| created_at | timestamp | NOT NULL | now() | Tao luc |
| avatar_url | varchar | NULL | - | Them boi migration thu 2 |

Rang buoc:
- PK: id
- UNIQUE: join_code
- FK: teacher_id -> users.id (ON DELETE RESTRICT)

### 3.5 class_members

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| class_id | uuid | NOT NULL | - | FK -> classes.id |
| user_id | uuid | NOT NULL | - | FK -> users.id |
| role | class_members_role_enum | NOT NULL | - | TEACHER/STUDENT |
| status | class_members_status_enum | NOT NULL | - | ACTIVE/PENDING/REJECTED |
| joined_at | timestamp | NOT NULL | now() | Ngay tham gia |

Rang buoc:
- PK: id
- UNIQUE INDEX: (class_id, user_id)
- FK: class_id -> classes.id (ON DELETE CASCADE)
- FK: user_id -> users.id (ON DELETE CASCADE)

### 3.6 weeks

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| class_id | uuid | NOT NULL | - | FK -> classes.id |
| title | varchar | NOT NULL | - | Tieu de tuan |
| week_number | integer | NOT NULL | - | So thu tu tuan |

Rang buoc:
- PK: id
- FK: class_id -> classes.id (ON DELETE CASCADE)

### 3.7 contents

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| week_id | uuid | NOT NULL | - | FK -> weeks.id |
| title | varchar | NOT NULL | - | Tieu de noi dung |
| type | contents_type_enum | NOT NULL | - | VIDEO/DOCUMENT/QUIZ |
| order_index | integer | NOT NULL | - | Thu tu hien thi |

Rang buoc:
- PK: id
- FK: week_id -> weeks.id (ON DELETE CASCADE)

### 3.8 content_pages

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| content_id | uuid | NOT NULL | - | FK -> contents.id, one-to-one |
| video_url | text | NULL | - | Link video |
| document_url | text | NULL | - | Link tai lieu |
| quiz_id | uuid | NULL | - | Dang luu uuid, chua FK |

Rang buoc:
- PK: id
- UNIQUE: content_id
- FK: content_id -> contents.id (ON DELETE CASCADE)

### 3.9 sections

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | SERIAL | NOT NULL | auto increment | PK |
| class_id | uuid | NOT NULL | - | FK -> classes.id |
| title | varchar | NOT NULL | - | Tieu de section |
| order_index | integer | NOT NULL | - | Thu tu |

Rang buoc:
- PK: id
- FK: class_id -> classes.id (ON DELETE CASCADE)

### 3.10 lessons

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | SERIAL | NOT NULL | auto increment | PK |
| section_id | integer | NOT NULL | - | FK -> sections.id |
| title | varchar | NOT NULL | - | Ten bai hoc |
| description | text | NOT NULL | - | Mo ta bai hoc |
| order_index | integer | NOT NULL | - | Thu tu |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id
- FK: section_id -> sections.id (ON DELETE CASCADE)

### 3.11 lesson_contents

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | SERIAL | NOT NULL | auto increment | PK |
| lesson_id | integer | NOT NULL | - | FK -> lessons.id |
| type | lesson_contents_type_enum | NOT NULL | - | video/file/text/quiz |
| title | varchar | NOT NULL | - | Tieu de |
| file_url | varchar | NULL | - | Link file/video |
| content | text | NULL | - | Noi dung text |
| duration | integer | NULL | - | Thoi luong |
| order_index | integer | NOT NULL | - | Thu tu |

Rang buoc:
- PK: id
- FK: lesson_id -> lessons.id (ON DELETE CASCADE)

### 3.12 video_sessions

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| class_id | uuid | NOT NULL | - | FK -> classes.id |
| host_id | uuid | NOT NULL | - | FK -> users.id |
| title | varchar | NOT NULL | - | Ten phong hoc |
| description | text | NULL | - | Mo ta |
| room_url | varchar | NULL | - | Link phong hop |
| started_at | timestamp | NULL | - | Bat dau |
| ended_at | timestamp | NULL | - | Ket thuc |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id
- FK: class_id -> classes.id (ON DELETE CASCADE)
- FK: host_id -> users.id (ON DELETE RESTRICT)

### 3.13 video_participants

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| video_session_id | uuid | NOT NULL | - | FK -> video_sessions.id |
| user_id | uuid | NOT NULL | - | FK -> users.id |
| role | video_participants_role_enum | NOT NULL | - | HOST/PARTICIPANT |
| joined_at | timestamp | NOT NULL | now() | Gio vao |
| left_at | timestamp | NULL | - | Gio ra |

Rang buoc:
- PK: id
- UNIQUE INDEX: (video_session_id, user_id)
- FK: video_session_id -> video_sessions.id (ON DELETE CASCADE)
- FK: user_id -> users.id (ON DELETE CASCADE)

### 3.14 assignments

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| class_id | uuid | NOT NULL | - | Tham chieu lop (chua co FK) |
| created_by | uuid | NOT NULL | - | Nguoi tao (chua co FK) |
| title | varchar | NOT NULL | - | Tieu de bai tap |
| description | text | NULL | - | Mo ta |
| due_date | timestamp | NULL | - | Han nop |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id

### 3.15 assignment_submissions

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| assignment_id | uuid | NOT NULL | - | FK -> assignments.id |
| student_id | uuid | NOT NULL | - | Nguoi nop (chua co FK) |
| content | text | NULL | - | Noi dung nop |
| file_url | varchar | NULL | - | Tep dinh kem |
| score | double precision | NULL | - | Diem |
| feedback | text | NULL | - | Nhan xet |
| submitted_at | timestamp | NOT NULL | now() | Thoi diem nop |

Rang buoc:
- PK: id
- FK: assignment_id -> assignments.id (ON DELETE CASCADE)

### 3.16 quizzes

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| title | varchar | NOT NULL | - | Ten quiz |
| description | text | NULL | - | Mo ta |
| time_limit | integer | NOT NULL | - | Gioi han thoi gian |
| total_questions | integer | NOT NULL | - | Tong cau hoi |
| created_by | uuid | NOT NULL | - | Nguoi tao (chua co FK) |
| is_random | boolean | NOT NULL | false | Tron cau hoi |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id

### 3.17 questions

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| quiz_id | uuid | NOT NULL | - | FK -> quizzes.id |
| question_text | text | NOT NULL | - | Noi dung cau hoi |
| option_a | text | NOT NULL | - | Lua chon A |
| option_b | text | NOT NULL | - | Lua chon B |
| option_c | text | NOT NULL | - | Lua chon C |
| option_d | text | NOT NULL | - | Lua chon D |
| correct_answer | varchar | NOT NULL | - | Dap an dung |

Rang buoc:
- PK: id
- FK: quiz_id -> quizzes.id (ON DELETE CASCADE)

### 3.18 answers

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | SERIAL | NOT NULL | auto increment | PK |
| question_id | uuid | NOT NULL | - | FK -> questions.id |
| content | text | NOT NULL | - | Noi dung dap an |
| is_correct | boolean | NOT NULL | - | Dung/sai |

Rang buoc:
- PK: id
- FK: question_id -> questions.id (ON DELETE CASCADE)

### 3.19 quiz_attempts

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| quiz_id | uuid | NOT NULL | - | FK -> quizzes.id |
| student_id | uuid | NOT NULL | - | Hoc vien lam bai (chua co FK) |
| start_time | timestamp | NOT NULL | now() | Bat dau |
| end_time | timestamp | NULL | - | Ket thuc |
| score | double precision | NULL | - | Diem |

Rang buoc:
- PK: id
- FK: quiz_id -> quizzes.id (ON DELETE CASCADE)

### 3.20 quiz_answers

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| attempt_id | uuid | NOT NULL | - | FK -> quiz_attempts.id |
| question_id | uuid | NOT NULL | - | FK -> questions.id |
| selected_answer | varchar | NOT NULL | - | Lua chon cua hoc vien |
| is_correct | boolean | NOT NULL | - | Cham dung/sai |

Rang buoc:
- PK: id
- FK: attempt_id -> quiz_attempts.id (ON DELETE CASCADE)
- FK: question_id -> questions.id (ON DELETE CASCADE)

### 3.21 discussions

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| class_id | uuid | NOT NULL | - | Lop hoc (chua co FK) |
| created_by | uuid | NOT NULL | - | Nguoi tao (chua co FK) |
| title | varchar | NOT NULL | - | Tieu de chu de |
| content | text | NULL | - | Noi dung |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id

### 3.22 messages

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| discussion_id | uuid | NOT NULL | - | FK -> discussions.id |
| user_id | uuid | NOT NULL | - | Nguoi gui (chua co FK) |
| content | text | NOT NULL | - | Noi dung tin nhan |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id
- FK: discussion_id -> discussions.id (ON DELETE CASCADE)

### 3.23 notifications

| Cot | Kieu | Null | Mac dinh | Ghi chu |
|---|---|---|---|---|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| user_id | uuid | NOT NULL | - | FK -> users.id |
| type | notifications_type_enum | NOT NULL | - | Loai thong bao |
| title | varchar | NOT NULL | - | Tieu de |
| message | text | NULL | - | Noi dung |
| is_read | boolean | NOT NULL | false | Da doc hay chua |
| read_at | timestamp | NULL | - | Thoi diem doc |
| created_at | timestamp | NOT NULL | now() | Tao luc |

Rang buoc:
- PK: id
- FK: user_id -> users.id (ON DELETE CASCADE)

## 4. Quan he giua cac bang

Quan he chinh theo FK hien co:

1. users -> student_profiles (1-1)
2. users -> teacher_profiles (1-1)
3. users -> classes (teacher_id, 1-n)
4. classes -> weeks (1-n)
5. weeks -> contents (1-n)
6. contents -> content_pages (1-1)
7. classes -> sections (1-n)
8. sections -> lessons (1-n)
9. lessons -> lesson_contents (1-n)
10. classes -> video_sessions (1-n)
11. users -> video_sessions (host_id, 1-n)
12. video_sessions -> video_participants (1-n)
13. users -> video_participants (1-n)
14. assignments -> assignment_submissions (1-n)
15. quizzes -> questions (1-n)
16. questions -> answers (1-n)
17. quizzes -> quiz_attempts (1-n)
18. quiz_attempts -> quiz_answers (1-n)
19. questions -> quiz_answers (1-n)
20. users -> notifications (1-n)
21. discussions -> messages (1-n)
22. classes -> class_members (1-n)
23. users -> class_members (1-n)

## 5. Index va unique

1. users.email unique
2. classes.join_code unique
3. student_profiles.student_code unique
4. student_profiles.user_id unique
5. teacher_profiles.user_id unique
6. content_pages.content_id unique
7. video_participants unique index (video_session_id, user_id)
8. class_members unique index (class_id, user_id)

Ghi chu: migration co tao ca UNIQUE va REL unique cho mot so one-to-one (student_profiles.user_id, teacher_profiles.user_id, content_pages.content_id). Day la hien tuong TypeORM tao constraint nhieu ten khac nhau nhung cung muc dich 1-1.

## 6. Cac diem can luu y quan trong

1. Migration mang tinh PostgreSQL cao:
	- Dung CREATE TYPE ... AS ENUM
	- Dung uuid_generate_v4()
2. Chua thay migration tao extension uuid-ossp.
	- Can dam bao DB da co: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
3. Mot so cot co y nghia FK nhung chua co ràng buoc FK o DB:
	- assignments.class_id
	- assignments.created_by
	- assignment_submissions.student_id
	- quizzes.created_by
	- quiz_attempts.student_id
	- discussions.class_id
	- discussions.created_by
	- messages.user_id
	- content_pages.quiz_id
4. Ho ten domain co the chua dong nhat:
	- Bang teacher_profiles trong khi module la instructor-profiles.

## 7. Thu tu migration hien tai

1. 1775881197833-InitSchema
	- Tao toan bo enum, bang, index, FK ban dau.
2. 1775881761133-AddClassAvatarUrl
	- Them cot classes.avatar_url.

## 8. Goi y bo sung tai lieu

Neu can tai lieu day du hon cho team moi, nen bo sung them:

1. Data dictionary theo nghiep vu (y nghia tung cot trong use-case).
2. ERD hinh anh tu migration/entity.
3. Quy tac dat ten va quy tac xoa du lieu (cascade/restrict).
4. Danh sach cot can index them theo workload truy van thuc te.

