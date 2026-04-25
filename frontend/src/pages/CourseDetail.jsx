import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { courses } from '../data/courses';

const lessonItems = [
  {
    id: 1,
    title: 'Giới thiệu học phần',
    duration: '15 phút',
    status: 'done',
  },
  {
    id: 2,
    title: 'Bài giảng chính: Compiler Pipeline',
    duration: '48 phút',
    status: 'in-progress',
  },
  {
    id: 3,
    title: 'Bài tập tự luyện tuần 1',
    duration: '30 phút',
    status: 'todo',
  },
];

const discussionItems = [
  'Q&A về assignment 1',
  'Thảo luận nhóm tối ưu mã nguồn',
  'Gợi ý làm mini project cuối kỳ',
];

const wikiItems = [
  'Thuật ngữ học phần',
  'Sơ đồ kiến trúc trình biên dịch',
  'Checklist ôn tập trước quiz',
];

const slideItems = [
  'Slide tuần 1 - Overview',
  'Slide tuần 2 - Lexical Analysis',
  'Slide tuần 3 - Syntax Parsing',
];

const statusStyles = {
  done: 'bg-emerald-100 text-emerald-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  todo: 'bg-slate-100 text-slate-600',
};

const statusLabels = {
  done: 'Đã học',
  'in-progress': 'Đang học',
  todo: 'Chưa học',
};

const tabOptions = [
  { key: 'lessons', label: 'Bài học' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'discussions', label: 'Thảo luận' },
  { key: 'wiki', label: 'Wiki' },
  { key: 'slides', label: 'Slide bài giảng' },
];

export default function CourseDetail() {
  const { courseId } = useParams();
  const course = courses.find((item) => String(item.id) === courseId);
  const [activeTab, setActiveTab] = useState('lessons');

  if (!course) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy khóa học</h1>
          <p className="mt-2 text-sm text-slate-500">Khóa học bạn truy cập không tồn tại trong danh sách mock hiện tại.</p>
          <Link to="/dashboard" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Quay lại dashboard
          </Link>
        </div>
      </main>
    );
  }

  const progressPercent = 38;

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr] md:p-6">
          <img
            src={course.image}
            alt={course.title}
            className="h-36 w-full rounded-xl bg-slate-100 object-contain p-3 md:h-44"
          />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              {course.category} · {course.code}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Trang chi tiết khóa học dạng placeholder để test bố cục FE. Dữ liệu đang là mock và sẽ được thay bằng API sau.
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Tiến độ học tập</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {tabOptions.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? 'border-indigo-200 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'lessons' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Bài học</h2>
          <p className="mt-1 text-sm text-slate-500">Danh sách bài học trong khóa học</p>
          <div className="mt-4 space-y-3">
            {lessonItems.map((lesson) => (
              <div key={lesson.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Thời lượng: {lesson.duration}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[lesson.status]}`}>
                    {statusLabels[lesson.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'progress' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Theo dõi tiến độ</h2>
          <p className="mt-1 text-sm text-slate-500">Tổng quan quá trình học tập</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">1</p>
              <p className="text-xs text-emerald-700">Đã hoàn thành</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
              <p className="text-xl font-bold text-amber-700">1</p>
              <p className="text-xs text-amber-700">Đang học</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-slate-700">1</p>
              <p className="text-xs text-slate-600">Chưa học</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'discussions' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Thảo luận</h2>
          <p className="mt-1 text-sm text-slate-500">Các chủ đề thảo luận gần đây</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {discussionItems.map((item) => (
              <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'wiki' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Wiki khóa học</h2>
          <p className="mt-1 text-sm text-slate-500">Tài liệu wiki và kiến thức nền</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {wikiItems.map((item) => (
              <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'slides' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Slide bài giảng</h2>
          <p className="mt-1 text-sm text-slate-500">Danh sách slide theo tuần học</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {slideItems.map((item) => (
              <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}