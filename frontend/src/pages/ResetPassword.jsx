import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api/auth.service';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <section className="px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-400/30 dark:bg-red-400/10">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Link không hợp lệ</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">Token đặt lại mật khẩu bị thiếu hoặc không đúng.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
            Gửi lại yêu cầu
          </Link>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err?.message || 'Token không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-4 py-12 transition-colors md:py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
            7Study
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Đặt lại mật khẩu</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nhập mật khẩu mới của bạn</p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-400/30 dark:bg-emerald-400/10">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Đặt lại mật khẩu thành công!</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mật khẩu mới
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
                Gửi lại email
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
