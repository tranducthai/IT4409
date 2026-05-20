import { useState } from 'react';
import { GraduationCap, User, ChevronDown, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logout as logoutAuth } from '../services/api/auth.service';
import { useTheme } from '../context/theme';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isCoursePage = location.pathname.startsWith('/courses/');
  const isLearningArea = isDashboard || isCoursePage;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
          <GraduationCap className="text-indigo-600" size={28} />
          <span className="text-xl font-bold text-indigo-900 dark:text-indigo-200 md:text-2xl">7Study</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Chuyển chế độ giao diện"
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Sáng' : 'Tối'}</span>
          </button>

          {isLearningArea ? (
            <div className="relative flex items-center gap-3 md:gap-6">
              <span className="hidden font-medium text-slate-700 dark:text-slate-300 md:inline">Khóa học của tôi</span>

              <div
                className="flex cursor-pointer items-center gap-1"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200">
                  <User size={24} />
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform dark:text-slate-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900">
                  <div className="cursor-pointer px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-800">Tiếp tục khóa học gần nhất</div>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setIsMenuOpen(false)}>Bảng điều khiển</Link>
                  <div className="cursor-pointer px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-800">Hồ sơ cá nhân</div>
                  <div className="cursor-pointer px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-800">Tài khoản</div>
                  <Link
                    to="/"
                    className="mt-1 block border-t border-slate-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                    onClick={() => {
                      logoutAuth();
                      setIsMenuOpen(false);
                    }}
                  >
                    Đăng xuất
                  </Link>
                </div>
              )}
            </div>
          ) : isAuthPage ? (
            <Link to="/" className="px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200" onClick={() => setIsMenuOpen(false)}>
              Về trang chủ
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link to="/register" className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800 md:px-6" onClick={() => setIsMenuOpen(false)}>
                Đăng ký
              </Link>
              <Link to="/login" className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 md:px-6" onClick={() => setIsMenuOpen(false)}>
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
