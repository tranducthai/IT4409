import { useState } from 'react';
import { GraduationCap, User, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logout as logoutAuth } from '../services/api/auth.service';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';
  const isCoursePage = location.pathname.startsWith('/courses/');
  const isLearningArea = isDashboard || isCoursePage;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
      <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
        <GraduationCap className="text-indigo-600" size={28} />
        <span className="text-xl font-bold text-indigo-900 md:text-2xl">Daotao.ai</span>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {isLearningArea ? (
          <div className="relative flex items-center gap-3 md:gap-6">
            <span className="hidden font-medium text-gray-700 md:inline">Khóa học của tôi</span>

            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200">
                <User size={24} />
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Tiếp tục khóa học gần nhất</div>
                <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Hồ sơ cá nhân</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Tài khoản</div>
                <Link
                  to="/"
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t mt-1"
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
          <Link to="/" className="px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-800" onClick={() => setIsMenuOpen(false)}>
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