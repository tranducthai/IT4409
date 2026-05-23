import {
  Activity,
  BookOpen,
  Clock3,
  Database,
  LayoutDashboard,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  UserCog,
  UsersRound,
} from 'lucide-react';

const adminMetrics = [
  {
    id: 'accounts',
    title: 'Tài khoản hệ thống',
    value: 'Chờ API',
    detail: 'Sinh viên, giảng viên, quản trị viên',
    icon: UsersRound,
    className: 'border-indigo-100 bg-indigo-50 text-indigo-800 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-100',
  },
  {
    id: 'classes',
    title: 'Lớp học toàn hệ thống',
    value: 'Chờ API',
    detail: 'Theo dõi lớp mở, đóng và trạng thái',
    icon: BookOpen,
    className: 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100',
  },
  {
    id: 'permissions',
    title: 'Phân quyền',
    value: 'ADMIN',
    detail: 'Vùng truy cập quản trị riêng',
    icon: ShieldCheck,
    className: 'border-amber-100 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100',
  },
  {
    id: 'health',
    title: 'Trạng thái tích hợp',
    value: 'Sẵn sàng',
    detail: 'Khung giao diện chờ endpoint backend',
    icon: Activity,
    className: 'border-sky-100 bg-sky-50 text-sky-800 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100',
  },
];

const adminModules = [
  {
    id: 'users',
    title: 'Quản lý tài khoản',
    description: 'Khung dành cho danh sách người dùng, lọc theo vai trò và khóa/mở tài khoản.',
    icon: UserCog,
    status: 'Chờ API người dùng',
  },
  {
    id: 'class-control',
    title: 'Quản lý lớp học',
    description: 'Khung theo dõi lớp toàn hệ thống, giáo viên phụ trách và trạng thái hoạt động.',
    icon: LayoutDashboard,
    status: 'Chờ API thống kê lớp',
  },
  {
    id: 'role-control',
    title: 'Quản lý phân quyền',
    description: 'Khung kiểm soát vai trò STUDENT, TEACHER, ADMIN và quyền truy cập dashboard.',
    icon: LockKeyhole,
    status: 'Chờ API cập nhật vai trò',
  },
];

const adminRows = [
  {
    area: 'Tài khoản',
    owner: 'ADMIN',
    state: 'Chưa nối API',
    note: 'Danh sách, tìm kiếm và đổi trạng thái tài khoản.',
  },
  {
    area: 'Lớp học',
    owner: 'ADMIN',
    state: 'Chưa nối API',
    note: 'Thống kê lớp, giáo viên phụ trách và số thành viên.',
  },
  {
    area: 'Phân quyền',
    owner: 'ROOT',
    state: 'Chưa nối API',
    note: 'Cập nhật vai trò và kiểm soát truy cập.',
  },
];

export default function AdminDashboard({ user }) {
  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                Bảng điều khiển quản trị
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
                Trung tâm quản trị hệ thống
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {user?.full_name ?? 'Quản trị viên'} đang đăng nhập với quyền ADMIN. Khu vực này được
                tách khỏi dashboard học tập để chuẩn bị cho các luồng quản trị toàn hệ thống.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
              <ShieldCheck className="h-4 w-4" />
              Quyền ADMIN
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {adminMetrics.map((metric) => {
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
                  <p className="mt-3 text-2xl font-bold">{metric.value}</p>
                  <p className="mt-1 text-xs opacity-80">{metric.detail}</p>
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
              <h2 className="mt-2 text-lg font-bold">Phiên root</h2>
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
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-200">
                Chờ backend
              </span>
            </div>
          </div>
        </aside>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <section
              key={module.id}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {module.status}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                {module.title}
              </h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {module.description}
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-400 dark:border-slate-800 dark:text-slate-500"
              >
                <Database className="h-4 w-4" />
                Chờ kết nối API
              </button>
            </section>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Bảng quản trị chờ backend
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Các vùng dữ liệu đã có khung hiển thị để nối endpoint quản trị sau.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Không gọi API mới
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Khu vực</th>
                  <th className="py-3 pr-4 font-semibold">Quyền xử lý</th>
                  <th className="py-3 pr-4 font-semibold">Trạng thái</th>
                  <th className="py-3 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {adminRows.map((row) => (
                  <tr key={row.area} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                      {row.area}
                    </td>
                    <td className="py-3 pr-4">{row.owner}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                        {row.state}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Nhật ký hệ thống
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Dành cho audit log khi backend bổ sung dữ liệu.
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Chưa có dữ liệu nhật ký
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Khi có API audit log, khu vực này sẽ hiển thị các thay đổi quan trọng trong hệ thống.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
