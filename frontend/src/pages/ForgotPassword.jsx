import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Gửi yêu cầu thất bại, vui lòng thử lại.');
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
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Quên mật khẩu</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-400/30 dark:bg-emerald-400/10">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Email đã được gửi!</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
              Kiểm tra hộp thư của bạn và làm theo hướng dẫn trong email.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
            >
              ← Quay lại đăng nhập
            </Link>
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
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">
                Đăng nhập
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
