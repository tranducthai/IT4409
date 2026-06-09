# Tài liệu Tổng hợp: Xây dựng Web Học tập Online (LMS) với React + Vite

---

## 1. ASSETS — Nguồn tài nguyên miễn phí

### 1.1 Hình ảnh & Illustrations

| Trang | Loại | Ghi chú |
|---|---|---|
| https://unsplash.com | Ảnh thật | Free, không cần attribution |
| https://pexels.com | Ảnh + Video | Free hoàn toàn |
| https://undraw.co | SVG Illustrations | Đổi màu theo brand, có chủ đề học tập |
| https://storyset.com | Illustrations có animation | Có chủ đề: học sinh, giảng viên, e-learning |
| https://humaaans.com | Minh họa nhân vật | Mix & match tự do |
| https://openpeeps.com | Illustrations người | Phong cách tối giản |
| https://freepik.com | Ảnh + Vector | Free với attribution |

**Gợi ý tìm kiếm trên Storyset & unDraw:**
- "studying", "online learning", "teacher", "student", "e-learning", "certificate", "quiz", "online class"

---

### 1.2 Icons & UI Elements

| Trang | Ghi chú |
|---|---|
| https://heroicons.com | SVG Icons của Tailwind team |
| https://phosphoricons.com | Bộ icon lớn, nhiều style — có: graduation cap, book, video, quiz, certificate |
| https://lucide.dev | Nhẹ, dùng tốt với React/Vue |
| https://flaticon.com | Icons đa dạng, free với attribution |
| https://svgrepo.com | Tổng hợp 500k+ SVG icons & illustrations |

---

### 1.3 Video & Animation

| Trang | Loại | Ghi chú |
|---|---|---|
| https://mixkit.co | Video + Animation | Có template giáo dục |
| https://pixabay.com | Video + Ảnh + Nhạc | Kho lớn, free |
| https://lottiefiles.com | Animation JSON (Lottie) | Nhẹ, dùng trong web rất mượt — phù hợp loading, success, badge |

---

### 1.4 Âm thanh & Nhạc nền

| Trang | Ghi chú |
|---|---|
| https://pixabay.com/music | Nhạc nền, free, no copyright |
| https://freesound.org | Sound effects cộng đồng chia sẻ |
| https://bensound.com | Nhạc nền, free với attribution |

---

### 1.5 Fonts

| Trang | Ghi chú |
|---|---|
| https://fonts.google.com | Phổ biến nhất, dễ tích hợp với React |
| https://fontesk.com | Font đẹp, ít phổ biến, cá tính hơn |

**Cặp font gợi ý cho LMS:**
- **Inter** (UI, navigation, button) + **Merriweather** (nội dung bài học, bài viết)
- **Nunito** + **Lora** (thân thiện, dễ đọc)

---

### 1.6 Badges & Certificates

| Trang | Ghi chú |
|---|---|
| https://badgr.com | Hệ thống open badge cho giáo dục |
| https://canva.com/education | Free cho trường học, thiết kế certificate |

---

## 2. UI COMPONENTS & TEMPLATES

### 2.1 So sánh thư viện UI

| | Shadcn/ui | Mantine |
|---|---|---|
| Style | Minimalist, clean | Đầy đủ hơn, nhiều component sẵn |
| Setup | Copy component vào project | Install package |
| Custom | Dễ custom hoàn toàn | Theme system mạnh |
| Phù hợp LMS | Rất tốt | Rất tốt |

> **Khuyến nghị:** Dùng **Shadcn/ui + Tailwind CSS** — chuẩn nhất cho Vite + React hiện tại.

---

### 2.2 Các trang lấy UI Component & Template

| Trang | Gì có |
|---|---|
| https://ui.shadcn.com | Component library React, clean, dễ custom |
| https://flowbite.com | UI components Tailwind — có card khóa học, dashboard |
| https://daisyui.com | Component library Tailwind — có theme sáng/tối |
| https://hyperui.dev | Tailwind blocks — copy-paste nhanh |
| https://cruip.com | Free templates — có landing page khóa học sẵn |

---

## 3. TECH STACK & SETUP

### 3.1 Danh sách thư viện cần cài

| Thư viện | Mục đích |
|---|---|
| tailwindcss | Styling utility-first |
| shadcn/ui | UI component library |
| lucide-react | Icons cho React |
| recharts | Charts & biểu đồ (dashboard) |
| framer-motion | Animation mượt mà |
| react-router-dom | Điều hướng trang |
| axios | Gọi API |

---

### 3.2 Lệnh cài đặt

```bash
# Tạo project Vite + React
npm create vite@latest my-lms -- --template react

# Di chuyển vào thư mục project
cd my-lms

# Cài Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Cài Shadcn/ui
npx shadcn@latest init

# Cài các thư viện bổ sung
npm install lucide-react
npm install recharts
npm install framer-motion
npm install react-router-dom
npm install axios
```

---

### 3.3 Cấu trúc thư mục dự án

```
my-lms/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Ảnh, SVG tĩnh, fonts
│   ├── components/
│   │   ├── ui/              # Shadcn components (Button, Card, Dialog...)
│   │   ├── layout/          # Navbar, Sidebar, Footer
│   │   ├── course/          # CourseCard, CourseList, CourseFilter
│   │   ├── dashboard/       # StatsCard, ProgressChart, ActivityFeed
│   │   └── quiz/            # QuizCard, QuestionItem, ResultCard
│   ├── pages/
│   │   ├── Home.jsx         # Landing page
│   │   ├── Courses.jsx      # Danh sách khóa học
│   │   ├── CourseDetail.jsx # Chi tiết khóa học
│   │   ├── Lesson.jsx       # Trang học bài (video + nội dung)
│   │   ├── Dashboard.jsx    # Dashboard sinh viên / giảng viên
│   │   ├── Quiz.jsx         # Làm bài kiểm tra
│   │   └── Profile.jsx      # Trang cá nhân
│   ├── hooks/               # Custom React hooks
│   ├── context/             # Auth context, Theme context
│   ├── utils/               # Helper functions
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

### 3.4 Cấu hình Tailwind (màu sắc & font LMS)

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          500: "#4f46e5",  // Indigo — học thuật, tin cậy
          600: "#4338ca",
          700: "#3730a3",
        },
        success: "#10b981",   // Emerald — progress, hoàn thành
        warning: "#f59e0b",   // Amber — deadline, thông báo
        neutral: {
          50:  "#f8fafc",     // Nền sáng dễ đọc
          900: "#0f172a",     // Text chính
        }
      },
      fontFamily: {
        sans:  ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      }
    }
  }
}
```

**Bảng màu tổng hợp:**

| Màu | Hex | Dùng cho |
|---|---|---|
| Primary | #4F46E5 (Indigo) | Button chính, link, highlight |
| Success | #10B981 (Emerald) | Progress bar, hoàn thành bài |
| Warning | #F59E0B (Amber) | Deadline, thông báo |
| Background | #F8FAFC | Nền trang, dễ đọc |
| Text | #0F172A | Nội dung chính |

---

## 4. CÁC TRANG CẦN XÂY DỰNG & ASSET TƯƠNG ỨNG

### 4.1 Landing Page / Trang chủ
- **Cần:** Hero illustration (Storyset — chủ đề "online learning"), ảnh background (Unsplash)
- **Icons:** Phosphor Icons (tính năng nổi bật)
- **Components:** Hero section, Feature cards, Testimonials, CTA button

### 4.2 Danh sách Khóa học
- **Cần:** Thumbnail ảnh khóa học (Unsplash/Pexels), icon danh mục (Phosphor/Lucide)
- **Components:** CourseCard (ảnh, tên, giảng viên, rating, giá), Filter bar, Pagination

### 4.3 Chi tiết Khóa học
- **Cần:** Ảnh banner, avatar giảng viên
- **Components:** Course banner, Syllabus accordion, Instructor card, Enroll button, Review section

### 4.4 Trang Học bài (Video + Nội dung)
- **Cần:** Video player UI, icon progress, icon sidebar
- **Components:** Video player, Lesson sidebar, Progress tracker, Note-taking area

### 4.5 Dashboard Sinh viên
- **Cần:** Chart (Recharts), icon streak, badge/certificate (LottieFiles animation)
- **Components:** Stats cards (khóa đang học, hoàn thành, chứng chỉ), Progress chart, Recent activity, Calendar

### 4.6 Dashboard Giảng viên
- **Cần:** Icon thống kê (Lucide), chart doanh thu/học viên (Recharts)
- **Components:** Revenue chart, Student list, Course management table, Upload course button

### 4.7 Trang Quiz / Bài kiểm tra
- **Cần:** Illustration (unDraw — "quiz", "exams"), icon đúng/sai (Lucide)
- **Components:** Question card, Timer, Progress bar, Result screen với animation (LottieFiles)

### 4.8 Trang Hồ sơ cá nhân
- **Cần:** Avatar placeholder, badge icons
- **Components:** Profile card, Certificate list, Enrolled courses, Edit profile form

---

## 5. GỢI Ý WORKFLOW XÂY DỰNG DỰ ÁN

1. **Setup project** — Vite + React + Tailwind + Shadcn/ui
2. **Thiết kế hệ thống màu & font** — cấu hình tailwind.config.js
3. **Xây dựng Layout** — Navbar, Sidebar, Footer
4. **Landing Page** — Hero, Features, CTA
5. **Trang Courses** — CourseCard, Filter, Search
6. **Auth** — Login, Register (sinh viên / giảng viên)
7. **Dashboard** — Stats, Charts, Progress
8. **Trang Học bài** — Video player + Sidebar bài học
9. **Quiz** — Question flow + Result
10. **Profile & Certificate**

---

*Tài liệu tổng hợp cho dự án LMS — React + Vite*
