import DashboardCard from '../../components/DashboardCard';

export default function StudentDashboard({ courses, isLoading = false, error = '' }) {
  const hasCourses = courses.length > 0;

  return (
    <>
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Student Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Khoa hoc cua toi
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Theo doi tien do va tiep tuc hoc cac lop ban da tham gia.
        </p>
      </div>

      {error && (
        <div className="mb-4 max-w-5xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="max-w-5xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Dang tai danh sach lop...
        </div>
      ) : hasCourses ? (
        <div className="max-w-5xl">
          {courses.map((item) => (
            <DashboardCard key={item.id} course={item} />
          ))}
        </div>
      ) : (
        <div className="max-w-5xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Ban chua tham gia khoa hoc nao.
        </div>
      )}
    </>
  );
}
