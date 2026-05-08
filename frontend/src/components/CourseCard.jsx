import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative h-40 bg-gray-100 dark:bg-slate-800">
        <img src={course.image} className="w-full h-full object-contain p-4" alt={course.title} />
        <div className="absolute right-2 top-2 rounded bg-blue-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {course.code}
        </div>
      </div>
      <div className="flex-grow p-4">
        <p className="text-xs font-bold uppercase text-gray-400 dark:text-slate-400">{course.category}</p>
        <p className="text-[11px] font-semibold text-blue-500 dark:text-blue-300">{course.code}</p>
        <h3 className="mt-1 text-sm font-bold leading-tight text-gray-800 line-clamp-2 dark:text-slate-100">{course.title}</h3>
      </div>
      {course.startDate && (
        <div className="px-4 pb-4">
          <p className="text-[10px] text-gray-400 dark:text-slate-500">Starts: {course.startDate}</p>
        </div>
      )}
    </Link>
  );
};
export default CourseCard;