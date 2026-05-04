import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginAuth } from '../services/api/auth.service';
import { setAuthTokens } from '../services/api/client';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await loginAuth({ email, password });
      if (data?.accessToken) {
        setAuthTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      const message = err?.payload?.message || err?.message || 'Đăng nhập thất bại';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Daotao.ai
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tiếp tục hành trình học tập của bạn
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Đăng ký ngay
          </Link>
        </p>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng của nền tảng.
        </div>
      </div>
    </section>
  );
}

export default Login;
