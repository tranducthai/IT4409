import { BookOpen, ShieldCheck, UserCog, UsersRound } from 'lucide-react';

const adminCards = [
  {
    id: 'users',
    title: 'Tài khoản',
    value: 'Root',
    icon: UserCog,
    className: 'border-indigo-100 bg-indigo-50 text-indigo-800 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-100',
  },
  {
    id: 'classes',
    title: 'Lớp học',
    value: 'Toàn hệ thống',
    icon: BookOpen,
    className: 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100',
  },
  {
    id: 'roles',
    title: 'Phân quyền',
    value: 'ADMIN',
    icon: ShieldCheck,
    className: 'border-amber-100 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100',
  },
];

export default function AdminDashboard({ user }) {
  return (
    <>
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Bảng điều khiển quản trị
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Quyền quản trị hệ thống
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {user?.full_name ?? 'Quản trị viên'} đang đăng nhập với quyền ADMIN.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`rounded-xl border p-4 transition-colors ${card.className}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{card.title}</p>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Luồng quyền ADMIN
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Truy cập quản trị được tách khỏi dashboard sinh viên và giảng viên.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
            <UsersRound className="h-4 w-4" />
            Root
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          ADMIN được điều hướng về dashboard quản trị riêng từ `/dashboard`.
          Các route dashboard sinh viên và giảng viên vẫn được guard theo vai trò tương ứng.
        </div>
      </section>
    </>
  );
}
