import { Link } from 'react-router-dom';

export default function DashboardCard({ course }) {
  return (
    <div className="mb-4 flex w-full flex-col gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
      <div className="h-40 w-full flex-shrink-0 md:h-28 md:w-48">
        <img src={course.image} className="h-full w-full rounded-xl bg-slate-100 object-cover dark:bg-slate-800" alt={course.title} />
      </div>
      <div className="min-w-0 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">{course.title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">SoICT • {course.code}</p>
        <Link
          to={`/courses/${course.id}`}
          className="action-btn mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Xem khóa học
        </Link>
      </div>
    </div>
  );
}
