import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const CLASS_TYPES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

function createJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function TeacherDashboard({
  courses,
  pendingRequests,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudent,
  onApproveRequest,
  isLoading = false,
  error = '',
}) {
  const hasCourses = courses.length > 0;
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    avatar_url: '',
    type: 'OPEN',
    join_code: createJoinCode(),
    is_active: true,
  });
  const [studentForm, setStudentForm] = useState({
    class_id: '',
    user_id: '',
  });
  const courseOptions = useMemo(
    () => courses.map((course) => ({ id: course.id, title: course.title })),
    [courses],
  );

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

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tao lop moi</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onCreateClass?.(newClass);
          }}
        >
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Ten lop"
            value={newClass.name}
            onChange={(e) => setNewClass((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Join code"
            value={newClass.join_code}
            onChange={(e) => setNewClass((prev) => ({ ...prev, join_code: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={newClass.type}
            onChange={(e) => setNewClass((prev) => ({ ...prev, type: e.target.value }))}
          >
            {CLASS_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Avatar URL"
            value={newClass.avatar_url}
            onChange={(e) => setNewClass((prev) => ({ ...prev, avatar_url: e.target.value }))}
          />
          <textarea
            className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Mo ta"
            value={newClass.description}
            onChange={(e) => setNewClass((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newClass.is_active}
              onChange={(e) => setNewClass((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Kich hoat lop
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Tao lop
          </button>
        </form>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Them sinh vien vao lop</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onAddStudent?.(studentForm);
          }}
        >
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={studentForm.class_id}
            onChange={(e) => setStudentForm((prev) => ({ ...prev, class_id: e.target.value }))}
            required
          >
            <option value="">Chon lop</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Student user_id"
            value={studentForm.user_id}
            onChange={(e) => setStudentForm((prev) => ({ ...prev, user_id: e.target.value }))}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Them sinh vien
          </button>
        </form>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Danh sach lop phu trach</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Dang tai danh sach lop...</p>
        ) : hasCourses ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-300">{course.code}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{course.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{course.type}</p>
                <div className="mt-3 grid gap-2 text-xs">
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1"
                    defaultValue={course.title}
                    onBlur={(e) => onUpdateClass?.(course.id, { name: e.target.value })}
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1"
                    defaultValue={course.code}
                    onBlur={(e) => onUpdateClass?.(course.id, { join_code: e.target.value })}
                  />
                </div>
                <Link
                  to={`/courses/${course.id}`}
                  className="mt-3 inline-block rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Xem chi tiet
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteClass?.(course.id)}
                  className="ml-2 mt-3 inline-block rounded-md bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Xoa lop
                </button>
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
                <button
                  type="button"
                  onClick={() => onApproveRequest?.(request.id)}
                  className="ml-3 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                >
                  Duyet
                </button>
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
