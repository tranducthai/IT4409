import { useState } from 'react';
import { Link } from 'react-router-dom';

const CLASS_TYPES = [
  { value: 'OPEN', label: 'Mở' },
  { value: 'CLOSED', label: 'Đóng' },
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
  onAddStudentByCode,
  onApproveRequest,
  onRejectRequest,
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
  const [studentCodeForms, setStudentCodeForms] = useState({});
  const [studentCodeErrors, setStudentCodeErrors] = useState({});
  const [studentCodeSuccess, setStudentCodeSuccess] = useState({});
  const [actionErrors, setActionErrors] = useState({});

  const handleStudentCodeChange = (courseId, value) => {
    setStudentCodeForms((prev) => ({ ...prev, [courseId]: value }));
  };

  const handleAddStudentSubmit = async (courseId) => {
    const code = String(studentCodeForms[courseId] ?? '').trim();
    if (!code) return;
    setStudentCodeErrors((prev) => ({ ...prev, [courseId]: '' }));
    setStudentCodeSuccess((prev) => ({ ...prev, [courseId]: '' }));
    try {
      await onAddStudentByCode?.({ class_id: courseId, student_code: code });
      setStudentCodeForms((prev) => ({ ...prev, [courseId]: '' }));
      setStudentCodeSuccess((prev) => ({ ...prev, [courseId]: `Đã thêm sinh viên ${code} vào lớp.` }));
    } catch (err) {
      setStudentCodeErrors((prev) => ({
        ...prev,
        [courseId]: err?.message || 'Không thêm được sinh viên.',
      }));
    }
  };

  const handleApprove = async (requestId) => {
    setActionErrors((prev) => ({ ...prev, [requestId]: '' }));
    try {
      await onApproveRequest?.(requestId);
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [requestId]: err?.message || 'Không duyệt được yêu cầu.',
      }));
    }
  };

  const handleReject = async (requestId) => {
    setActionErrors((prev) => ({ ...prev, [requestId]: '' }));
    try {
      await onRejectRequest?.(requestId);
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [requestId]: err?.message || 'Không từ chối được yêu cầu.',
      }));
    }
  };

  return (
    <>
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Bảng điều khiển giảng viên
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Lớp học giảng dạy
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quản lý lớp, duyệt yêu cầu tham gia và thêm sinh viên.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-400/30 dark:bg-indigo-400/10">
          <p className="text-sm text-indigo-700 dark:text-indigo-200">Tổng lớp đang dạy</p>
          <p className="mt-2 text-2xl font-bold text-indigo-900 dark:text-indigo-100">{courses.length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-400/10">
          <p className="text-sm text-amber-700 dark:text-amber-200">Yêu cầu chờ duyệt</p>
          <p className="mt-2 text-2xl font-bold text-amber-900 dark:text-amber-100">{pendingRequests.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-400/30 dark:bg-emerald-400/10">
          <p className="text-sm text-emerald-700 dark:text-emerald-200">Trạng thái hệ thống</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900 dark:text-emerald-100">Ổn định</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section className="mb-6 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm dark:border-amber-400/30 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            Yêu cầu tham gia lớp
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
              {pendingRequests.length}
            </span>
          </h2>
          <ul className="mt-4 space-y-3">
            {pendingRequests.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {req.user?.full_name ?? req.user_id}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {req.user?.email ?? ''} · Lớp: <span className="font-medium text-slate-700 dark:text-slate-200">{req.class_name ?? req.class_id}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Gửi lúc: {req.joined_at ? new Date(req.joined_at).toLocaleString('vi-VN') : ''}
                  </p>
                  {actionErrors[req.id] && (
                    <p className="mt-1 text-xs text-rose-600">{actionErrors[req.id]}</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300"
                  >
                    Từ chối
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Create class */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tạo lớp mới</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onCreateClass?.(newClass);
          }}
        >
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Tên lớp"
            value={newClass.name}
            onChange={(e) => setNewClass((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase tracking-widest dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Mã tham gia"
            value={newClass.join_code}
            onChange={(e) => setNewClass((prev) => ({ ...prev, join_code: e.target.value.toUpperCase() }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={newClass.type}
            onChange={(e) => setNewClass((prev) => ({ ...prev, type: e.target.value }))}
          >
            {CLASS_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="URL ảnh đại diện"
            value={newClass.avatar_url}
            onChange={(e) => setNewClass((prev) => ({ ...prev, avatar_url: e.target.value }))}
          />
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
            placeholder="Mô tả"
            value={newClass.description}
            onChange={(e) => setNewClass((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={newClass.is_active}
              onChange={(e) => setNewClass((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Kích hoạt lớp
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Tạo lớp
          </button>
        </form>
      </section>

      {/* Class list */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Danh sách lớp phụ trách</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Đang tải danh sách lớp...</p>
        ) : hasCourses ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                {/* Course header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                      {course.code}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500">{course.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Vào lớp
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDeleteClass?.(course.id)}
                      className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Edit name / join_code */}
                <div className="mt-3 grid gap-2 text-xs">
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    defaultValue={course.title}
                    placeholder="Tên lớp"
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val && val !== course.title) onUpdateClass?.(course.id, { name: val });
                    }}
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1 font-mono uppercase tracking-widest dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    defaultValue={course.code}
                    placeholder="Mã tham gia"
                    onBlur={(e) => {
                      const val = e.target.value.trim().toUpperCase();
                      if (val && val !== course.code) onUpdateClass?.(course.id, { join_code: val });
                    }}
                  />
                </div>

                {/* Add student by MSSV */}
                <form
                  className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700"
                  onSubmit={(e) => { e.preventDefault(); void handleAddStudentSubmit(course.id); }}
                >
                  <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Thêm sinh viên bằng MSSV
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Nhập MSSV (VD: 20210001)"
                      value={studentCodeForms[course.id] ?? ''}
                      onChange={(e) => handleStudentCodeChange(course.id, e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </div>
                  {studentCodeErrors[course.id] && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">
                      {studentCodeErrors[course.id]}
                    </p>
                  )}
                  {studentCodeSuccess[course.id] && (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
                      {studentCodeSuccess[course.id]}
                    </p>
                  )}
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Chưa có lớp nào được gán cho giảng viên.</p>
        )}
      </section>
    </>
  );
}
