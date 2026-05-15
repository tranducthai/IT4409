import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCurrentUser } from '../services/api/session';
import { getCourseDetailData } from '../services/dataSource';

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
  { key: 'resources', label: 'Tài nguyên' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'discussions', label: 'Thảo luận' },
];

export default function CourseDetail() {
  const { courseId } = useParams();
  const courseData = getCourseDetailData(courseId, getCurrentUser()?.id);
  const { course } = courseData;
  const [activeTab, setActiveTab] = useState('lessons');

  const sectionItems = courseData.sections;
  const lessonItems = courseData.lessons;
  const resourceItems = courseData.resources;
  const discussionItems = courseData.discussions;
  const progress = courseData.progress;

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

  const progressPercent = progress.progressPercent;
  const totalSections = sectionItems.length;
  const totalLessons = lessonItems.length;
  const totalResources = resourceItems.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 transition-colors md:px-8">
      <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr] md:p-6">
          <img
            src={course.image}
            alt={course.title}
            className="h-36 w-full rounded-xl bg-slate-100 object-contain p-3 dark:bg-slate-800 md:h-44"
          />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
              {course.category} · {course.code}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Trang chi tiet khoa hoc dang dung mock data theo schema backend de test giao dien truoc khi cắm API that.
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Tiến độ học tập</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sections</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalSections}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Bai hoc</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalLessons}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tai nguyen</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalResources}</p>
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
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200'
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
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bai hoc</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Danh sach bai hoc duoc nhom theo section</p>
          <div className="mt-4 space-y-4">
            {sectionItems.map((section) => (
              <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{section.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.lessonCount} bai hoc</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                    Week {section.orderIndex}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-xl border border-white bg-white p-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lesson.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{lesson.description}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Thoi luong: {lesson.duration} · {lesson.contentCount} tai nguyen con
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[lesson.status]}`}>
                          {statusLabels[lesson.status]}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {lesson.contentTypes.map((type) => (
                          <span
                            key={`${lesson.id}-${type}`}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'resources' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tai nguyen hoc tap</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tong hop wiki va slide de chuan bi cho API that sau nay</p>
          <div className="mt-4 space-y-4">
            {resourceItems.map((group) => (
              <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{group.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.description}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-lg border border-white bg-white px-3 py-2 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'progress' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Theo doi tien do</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tong quan qua trinh hoc tap</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center transition-colors dark:border-emerald-400/30 dark:bg-emerald-400/10">
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-200">{progress.completed}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-200">Da hoan thanh</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center transition-colors dark:border-amber-400/30 dark:bg-amber-400/10">
              <p className="text-xl font-bold text-amber-700 dark:text-amber-200">{progress.inProgress}</p>
              <p className="text-xs text-amber-700 dark:text-amber-200">Dang hoc</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center transition-colors dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{progress.todo}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Chua hoc</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'discussions' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Thao luan</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cac chu de thao luan gan day</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {discussionItems.map((item) => (
              <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition-colors dark:border-slate-800 dark:bg-slate-950">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}