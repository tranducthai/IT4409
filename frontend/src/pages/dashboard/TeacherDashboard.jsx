import { Link } from 'react-router-dom';

export default function TeacherDashboard({ courses, pendingRequests }) {
  const hasCourses = courses.length > 0;

  return (
    <>
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Teacher Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Lop hoc giang day
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quan ly lop, theo doi yeu cau tham gia va cap nhat noi dung bai giang.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 transition-colors dark:border-indigo-400/30 dark:bg-indigo-400/10">
          <p className="text-sm text-indigo-700 dark:text-indigo-200">Tong lop dang day</p>
          <p className="mt-2 text-2xl font-bold text-indigo-900 dark:text-indigo-100">{courses.length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 transition-colors dark:border-amber-400/30 dark:bg-amber-400/10">
          <p className="text-sm text-amber-700 dark:text-amber-200">Yeu cau cho duyet</p>
          <p className="mt-2 text-2xl font-bold text-amber-900 dark:text-amber-100">{pendingRequests.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 transition-colors dark:border-emerald-400/30 dark:bg-emerald-400/10">
          <p className="text-sm text-emerald-700 dark:text-emerald-200">Trang thai he thong</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900 dark:text-emerald-100">On dinh</p>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Danh sach lop phu trach</h2>
        {hasCourses ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-300">{course.code}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{course.title}</h3>
                <Link
                  to={`/courses/${course.id}`}
                  className="mt-3 inline-block rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Xem chi tiet
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Chua co lop nao duoc gan cho giang vien.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Yeu cau tham gia lop</h2>
        {pendingRequests.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {pendingRequests.map((request) => (
              <li key={request.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                Request {request.id.slice(0, 8)} - Class {request.class_id.slice(-4)} - Status {request.status}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Khong co yeu cau nao can duyet.</p>
        )}
      </section>
    </>
  );
}
