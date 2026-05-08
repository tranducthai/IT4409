import CourseCard from '../components/CourseCard';
import { getHomeCourses } from '../services/dataSource';

export default function Home() {
  const courses = getHomeCourses();
  const hasCourses = courses.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 transition-colors md:px-8 md:py-12">
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Danh sách khóa học</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">Khóa học nổi bật</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Khám phá các khóa học phù hợp với chuyên ngành của bạn.</p>
      </div>

      {hasCourses ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {courses.map((item) => (
            <CourseCard key={item.id} course={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Hiện chưa có khóa học để hiển thị.
        </div>
      )}
    </main>
  );
}