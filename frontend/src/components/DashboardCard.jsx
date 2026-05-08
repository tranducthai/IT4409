import { Link } from 'react-router-dom';

export default function DashboardCard({ course }) {
  return (
    <div className="mb-4 flex items-center gap-6 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="w-48 h-28 flex-shrink-0">
        <img src={course.image} className="w-full h-full object-cover rounded-lg" alt={course.title} />
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">{course.title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">SoICT • {course.code}</p>
        <Link
          to={`/courses/${course.id}`}
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}