import { Link } from 'react-router-dom';

export default function DashboardCard({ course }) {
  return (
    <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 p-4 gap-6 items-center shadow-sm">
      <div className="w-48 h-28 flex-shrink-0">
        <img src={course.image} className="w-full h-full object-cover rounded-lg" alt={course.title} />
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
        <p className="text-sm text-gray-500 mt-1">SoICT • {course.code}</p>
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