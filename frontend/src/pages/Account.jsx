import AccountManagementCard from '../components/AccountManagementCard';
import { getCurrentUser } from '../services/api/session';

export default function Account() {
  const currentUser = getCurrentUser();

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Tài khoản
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Bảo mật và đăng nhập
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quản lý thông tin phiên đăng nhập và đổi mật khẩu tài khoản.
        </p>
      </div>

      <AccountManagementCard user={currentUser} />
    </main>
  );
}
