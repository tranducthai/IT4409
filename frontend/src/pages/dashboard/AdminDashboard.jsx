import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  Clock3,
  LayoutDashboard,
  ServerCog,
  ShieldCheck,
  UserCog,
  UsersRound,
} from 'lucide-react';
import { getAllClasses } from '../../services/api/classes.service';
import { getAllUsers } from '../../services/api/users.service';

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item?.[key] ?? 'UNKNOWN';
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function formatDate(value) {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có';
  return date.toLocaleDateString('vi-VN');
}

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);
      setError('');

      try {
        const [loadedUsers, loadedClasses] = await Promise.all([
          getAllUsers(),
          getAllClasses(),
        ]);

        if (!isMounted) return;
        setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
        setClasses(Array.isArray(loadedClasses) ? loadedClasses : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || 'Không tải được dữ liệu quản trị.');
        setUsers([]);
        setClasses([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const roleCounts = useMemo(() => countBy(users, 'role'), [users]);
  const classTypeCounts = useMemo(() => countBy(classes, 'type'), [classes]);
  const activeClasses = useMemo(
    () => classes.filter((cls) => cls?.is_active !== false).length,
    [classes],
  );

  const metrics = [
    {
      id: 'accounts',
      title: 'Tài khoản hệ thống',
      value: users.length,
      detail: `${roleCounts.STUDENT ?? 0} SV · ${roleCounts.TEACHER ?? 0} GV · ${roleCounts.ADMIN ?? 0} admin`,
      icon: UsersRound,
      className: 'border-indigo-100 bg-indigo-50 text-indigo-800 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-100',
    },
    {
      id: 'classes',
      title: 'Lớp học toàn hệ thống',
      value: classes.length,
      detail: `${activeClasses} đang hoạt động · ${classTypeCounts.OPEN ?? 0} mở`,
      icon: BookOpen,
      className: 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100',
    },
    {
      id: 'permissions',
      title: 'Phân quyền',
      value: 'ADMIN',
      detail: 'Đọc dữ liệu người dùng và lớp học',
      icon: ShieldCheck,
      className: 'border-amber-100 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100',
    },
    {
      id: 'health',
      title: 'Trạng thái tích hợp',
      value: error ? 'Lỗi' : 'Đã nối',
      detail: error || 'Đang dùng API thật',
      icon: Activity,
      className: error
        ? 'border-rose-100 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100'
        : 'border-sky-100 bg-sky-50 text-sky-800 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100',
    },
  ];

  const recentUsers = users.slice(0, 8);
  const recentClasses = classes.slice(0, 8);

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                Bảng điều khiển quản trị
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
                Trung tâm quản trị hệ thống
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {user?.full_name ?? 'Quản trị viên'} đang đăng nhập với quyền ADMIN. Khu vực này
                đọc dữ liệu người dùng và lớp học từ API thật.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
              <ShieldCheck className="h-4 w-4" />
              Quyền ADMIN
            </span>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.id}
                  className={`rounded-xl border p-4 transition-colors ${metric.className}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{metric.title}</p>
                    <Icon className="h-5 w-5 shrink-0" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">{isLoading ? '...' : metric.value}</p>
                  <p className="mt-1 text-xs opacity-80">{isLoading ? 'Đang tải dữ liệu...' : metric.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-left text-slate-100 shadow-sm transition-colors dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                Phiên quản trị
              </p>
              <h2 className="mt-2 text-lg font-bold">Phiên admin</h2>
            </div>
            <ServerCog className="h-6 w-6 text-sky-300" />
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <span>Email</span>
              <span className="max-w-44 truncate font-semibold text-white">
                {user?.email ?? 'Chưa có email'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <span>Vai trò</span>
              <span className="font-semibold text-emerald-300">ADMIN</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>API quản trị</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                Đã kết nối
              </span>
            </div>
          </div>
        </aside>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <UserCog className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              /users
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Quản lý tài khoản
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Xem nhanh danh sách người dùng và phân bổ vai trò trong hệ thống.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              /classes
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Quản lý lớp học
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Theo dõi lớp đang mở, trạng thái hoạt động và giáo viên phụ trách.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Clock3 className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              MVP
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Audit log
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Nhật ký quản trị có thể bổ sung sau, không chặn luồng demo chính.
          </p>
        </section>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Người dùng gần đây
          </h2>
          <div className="mt-5 max-w-full overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Họ tên</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Vai trò</th>
                  <th className="py-3 font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentUsers.map((item) => (
                  <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.full_name}
                    </td>
                    <td className="py-3 pr-4">{item.email}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
                {!isLoading && recentUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-500 dark:text-slate-400">
                      Chưa có người dùng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Lớp học gần đây
          </h2>
          <div className="mt-5 max-w-full overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Lớp</th>
                  <th className="py-3 pr-4 font-semibold">Mã</th>
                  <th className="py-3 pr-4 font-semibold">Loại</th>
                  <th className="py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentClasses.map((item) => (
                  <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-3 pr-4">{item.join_code}</td>
                    <td className="py-3 pr-4">{item.type}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.is_active === false
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
                      }`}
                      >
                        {item.is_active === false ? 'Tạm dừng' : 'Hoạt động'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isLoading && recentClasses.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-500 dark:text-slate-400">
                      Chưa có lớp học.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
