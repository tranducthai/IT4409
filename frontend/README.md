# IT4409 Frontend - Huong Dan Test va Tich Hop API

README nay duoc chia thanh 2 che do:

- Test FE doc lap bang mock data de hoan thien giao dien truoc.
- Khi backend san sang thi chi can tat mock va tro ve API that.

Muc tieu la:

- Chay duoc frontend nhanh va on dinh.
- Test UI theo route chinh.
- San sang tich hop API that khi backend merge endpoint moi.
- Neu API chua san sang, su dung mock data bam sat schema backend.

## 1. Yeu cau moi truong

- Node.js: khuyen nghi >= 20
- npm: khuyen nghi >= 10

## 2. Neu muon test API that, chay backend de mo Swagger UI

Tu thu muc goc project:

```bash
cd backend
npm install
npm run start:dev
```

Swagger UI:

http://localhost:3000/api/docs

Neu ban chi muon test giao dien FE, co the bo qua buoc nay va dung mock mode o buoc 3.

## 3. Tao va cau hinh file .env

Trong thu muc `frontend`, tao file `.env` tu mau co san:

```bash
cp .env.example .env
```

Mac dinh file `.env` nen co:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=true
VITE_MOCK_SESSION_ROLE=STUDENT
```

Y nghia cac bien:

- `VITE_API_BASE_URL`: Base URL backend cho cac API call.
- `VITE_USE_MOCK_DATA`: Bat/tat che do mock (`true` hoac `false`).
- `VITE_MOCK_SESSION_ROLE`: Role gia lap de test UI (`STUDENT`, `TEACHER`, `ADMIN`).

### 3.1 Che do test FE doc lap

De test giao dien khong can BE, dat:

```env
VITE_USE_MOCK_DATA=true
VITE_MOCK_SESSION_ROLE=STUDENT
```

Trong che do nay:

- Login/Register se tra ve mock token va mock user.
- Dashboard/Course detail se doc theo mock session.
- Logout se xoa token va mock session.

Neu muon test giao dien vai tro giang vien, doi thanh:

```env
VITE_MOCK_SESSION_ROLE=TEACHER
```

Sau khi doi `.env`, restart lai Vite dev server.

## 4. Chay frontend

Tu thu muc goc project:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Mo tren trinh duyet:

- http://localhost:5173
- Neu 5173 dang ban, Vite se tu dong nhay sang cong khac (vd: 5174)

### 4.1 Test nhanh FE doc lap

1. De `VITE_USE_MOCK_DATA=true`.
2. Chay frontend.
3. Vao `/login` hoac `/register` va submit nhu mot luong that.
4. Sau khi thanh cong, vao `/dashboard` de kiem tra UI theo role mock.
5. Bam mot course card de vao `/courses/:id` va kiem tra tab trong course detail.

## 5. Route test frontend hien tai

- Home: / 
- Dashboard: /dashboard
- Login: /login
- Register: /register
- Course detail (mock, id ngan): /courses/1
- Course detail (mock, id day du UUID): /courses/1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001
- Course detail not found (fallback): /courses/999

## 6. Checklist test nhanh

### 6.1 Test giao dien

- Kiem tra Home, Dashboard, Login, Register, Course detail hien thi dung layout.
- Kiem tra responsive tren mobile width va desktop width.
- Kiem tra Header/Footer hien thi nhat quan giua cac route.

### 6.2 Test dieu huong

- Tu Home bam vao course card phai vao route /courses/:id.
- Tu Dashboard bam "View Course" phai vao route /courses/:id.
- Trong Course detail: tab mac dinh la "Bai hoc".
- Bam cac tab khac (Tien do, Thao luan, Wiki, Slide) phai doi noi dung tuong ung.

### 6.3 Test form auth (UI stage)

- Neu dang o mock mode (`VITE_USE_MOCK_DATA=true`), Login/Register se "dang nhap" duoc ma khong can BE.
- Neu tat mock mode, Login/Register se goi API that va se bao loi neu backend chua chay.
- Validate co ban (mat khau xac nhan) hoat dong dung.

### 6.4 Test theo role (mock session)

- Dat `VITE_MOCK_SESSION_ROLE=STUDENT` roi vao `/dashboard` de test giao dien sinh vien.
- Dat `VITE_MOCK_SESSION_ROLE=TEACHER` roi vao `/dashboard` de test giao dien giang vien.
- Sau khi doi env, restart lai Vite dev server.

## 7. Ke hoach test API theo tung muc uu tien

Khi backend san sang endpoint, tich hop theo thu tu:

1. Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me

2. Class theo role:
- GET /api/class-members/me/student-classes
- GET /api/class-members/me/teacher-classes

3. Forgot/reset password:
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

## 8. Mock data tham khao (bam sat schema backend)

Trong giai doan chua co API that, nen mock theo field name backend de giam cong map sau nay.

Schema tham chieu chinh:

- users
- classes
- class_members
- sections
- lessons
- lesson_contents

Vi du mock data:

```js
export const mockUsers = [
   {
      id: '2d2f00c3-6f73-4db4-8f6d-8cb2bc44c111',
      full_name: 'Nguyen Van A',
      email: 'student1@example.com',
      role: 'STUDENT',
      avatar_url: null,
      created_at: '2026-04-20T02:00:00.000Z',
      updated_at: '2026-04-20T02:00:00.000Z',
   },
   {
      id: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
      full_name: 'Tran Thi B',
      email: 'teacher1@example.com',
      role: 'TEACHER',
      avatar_url: null,
      created_at: '2026-04-20T02:10:00.000Z',
      updated_at: '2026-04-20T02:10:00.000Z',
   },
];

export const mockClasses = [
   {
      id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
      name: 'Xay dung chuong trinh dich',
      description: 'Mon hoc ve compiler pipeline',
      avatar_url: null,
      type: 'PUBLIC',
      teacher_id: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
      join_code: 'IT3323-ABC',
      is_active: true,
      created_at: '2026-04-20T03:00:00.000Z',
   },
];

export const mockClassMembers = [
   {
      id: '7b0d8f93-7cc4-45cb-89c8-a0a0f9660001',
      class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
      user_id: '2d2f00c3-6f73-4db4-8f6d-8cb2bc44c111',
      role: 'Student',
      status: 'Active',
      joined_at: '2026-04-21T08:00:00.000Z',
   },
];

export const mockSections = [
   {
      id: 1,
      class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
      title: 'Week 1 - Introduction',
      order_index: 1,
   },
];

export const mockLessons = [
   {
      id: 1,
      section_id: 1,
      title: 'Compiler Overview',
      description: 'Tong quan ve cac pha trong compiler',
      order_index: 1,
      created_at: '2026-04-21T09:00:00.000Z',
   },
];

export const mockLessonContents = [
   {
      id: 1,
      lesson_id: 1,
      type: 'Video',
      title: 'Video bai giang 1',
      file_url: 'https://example.com/video-1',
      content: null,
      duration: 900,
      order_index: 1,
   },
   {
      id: 2,
      lesson_id: 1,
      type: 'Text',
      title: 'Tom tat bai hoc',
      file_url: null,
      content: 'Noi dung tom tat...',
      duration: null,
      order_index: 2,
   },
];
```

Goi y luu mock:

- Neu mock nho: de trong `src/data/*.js`.
- Neu mock theo domain: tach `src/mocks/auth`, `src/mocks/classes`, `src/mocks/courses`.

## 9. Quy uoc de doi mock sang API that

- Giu nguyen ten field theo backend (snake_case) o API layer.
- O UI layer, map sang model hien thi neu can.
- Tat mock khi endpoint backend on dinh, khong doi component UI.

## 10. Lenh huu ich

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Tat dev server

- Trong terminal dang chay Vite: bam Ctrl + C

## 11. Ghi chu

- Trong giai doan dev, FE uu tien theo tien do BE. 
- Chuc nang nao BE chua on dinh thi FE dung placeholder/mock de test UX.
