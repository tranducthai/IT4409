import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="action-btn flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400/60"
    >
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
        <img src={course.image || '/favicon.svg'} className="h-full w-full object-contain p-4" alt={course.title} />
        <div className="absolute right-2 top-2 rounded bg-indigo-900/85 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {course.code}
        </div>
      </div>
      <div className="flex-grow p-4">
        <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-400">{course.category}</p>
        <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-300">{course.code}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">{course.title}</h3>
      </div>
      {course.startDate && (
        <div className="px-4 pb-4">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Bắt đầu: {course.startDate}</p>
        </div>
      )}
    </Link>
  );
};
export default CourseCard;
