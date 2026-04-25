import DashboardCard from '../components/DashboardCard';
import { courses } from '../data/courses';

export default function Dashboard() {
  const hasCourses = courses.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Khóa học của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi tiến độ và tiếp tục học các lớp bạn đã tham gia.</p>
      </div>

      {hasCourses ? (
        <div className="max-w-5xl">
          {courses.map((item) => (
            <DashboardCard key={item.id} course={item} />
          ))}
        </div>
      ) : (
        <div className="max-w-5xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
          Bạn chưa tham gia khóa học nào.
        </div>
      )}
    </main>
  );
}