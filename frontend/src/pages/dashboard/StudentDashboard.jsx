import { useState } from 'react';
import DashboardCard from '../../components/DashboardCard';

export default function StudentDashboard({ courses, isLoading = false, error = '', onJoinByCode }) {
  const hasCourses = courses.length > 0;
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const handleJoin = async (event) => {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinLoading(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      await onJoinByCode?.(code);
      setJoinCode('');
      setJoinSuccess('Yêu cầu tham gia đã được gửi! Chờ giảng viên duyệt.');
    } catch (err) {
      setJoinError(err?.message || 'Không tham gia được lớp học.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Bảng điều khiển sinh viên
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Khóa học của tôi
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Theo dõi tiến độ và tiếp tục học các lớp bạn đã tham gia.
        </p>
      </div>

      {/* Join class by code */}
      <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 transition-colors dark:border-indigo-400/30 dark:bg-indigo-400/10">
        <h2 className="text-base font-bold text-indigo-900 dark:text-indigo-100">Tham gia lớp học</h2>
        <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
          Nhập mã lớp do giảng viên cung cấp để gửi yêu cầu tham gia.
        </p>
        <form className="mt-3 flex flex-wrap items-center gap-3" onSubmit={handleJoin}>
          <input
            className="h-10 flex-1 rounded-lg border border-indigo-200 bg-white px-3 text-sm font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal dark:border-indigo-400/40 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Nhập mã lớp (VD: ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={20}
            required
          />
          <button
            type="submit"
            disabled={joinLoading || !joinCode.trim()}
            className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joinLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>
        {joinError && (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{joinError}</p>
        )}
        {joinSuccess && (
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{joinSuccess}</p>
        )}
      </section>

      {error && (
        <div className="mb-4 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Đang tải danh sách lớp...
        </div>
      ) : hasCourses ? (
        <div className="w-full">
          {courses.map((item) => (
            <DashboardCard key={item.id} course={item} />
          ))}
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Bạn chưa tham gia khóa học nào.
        </div>
      )}
    </>
  );
}
