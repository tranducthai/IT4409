import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  UserRound,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logout as logoutAuth } from '../services/api/auth.service';
import { getCurrentUser } from '../services/api/session';
import { useTheme } from '../context/theme';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentUser = getCurrentUser();
  const currentRole = String(currentUser?.role ?? '').toUpperCase();

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isCoursePage = location.pathname.startsWith('/courses/');
  const isAccountArea = location.pathname === '/account' || location.pathname === '/profile';
  const isLearningArea = isDashboard || isCoursePage || isAccountArea;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const displayName = currentUser?.full_name || currentUser?.email || 'Tài khoản';
  const displayRole = currentRole === 'ADMIN' ? 'Quản trị viên' : currentRole === 'TEACHER' ? 'Giáo viên' : 'Học viên';
  const menuItems = [
    { to: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, active: isDashboard },
    { to: '/profile', label: 'Hồ sơ cá nhân', icon: UserRound, active: location.pathname === '/profile' },
    { to: '/account', label: 'Tài khoản', icon: Settings, active: location.pathname === '/account' },
  ];

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const menuItemClassName = (isActive) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
      isActive
        ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
    }`;

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
            className="action-btn inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Chuyển chế độ giao diện"
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Sáng' : 'Tối'}</span>
          </button>

          {isLearningArea ? (
            <div ref={menuRef} className="relative flex items-center gap-3 md:gap-6">
              <span className="hidden font-medium text-slate-700 dark:text-slate-300 md:inline">
                {currentRole === 'ADMIN' ? 'Quản trị' : 'Khóa học của tôi'}
              </span>

              <button
                type="button"
                className="action-btn flex items-center gap-1 rounded-full px-1 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label="Mở menu tài khoản"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200">
                  <User size={24} />
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform dark:text-slate-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900" role="menu">
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{displayName}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{displayRole}</p>
                  </div>

                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={menuItemClassName(item.active)}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                        aria-current={item.active ? 'page' : undefined}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <Link
                    to="/"
                    className="mt-1 flex items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-500/10"
                    onClick={() => {
                      logoutAuth();
                      setIsMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </Link>
                </div>
              )}
            </div>
          ) : isAuthPage ? (
            <Link to="/" className="action-btn rounded-lg px-4 py-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200" onClick={() => setIsMenuOpen(false)}>
              Về trang chủ
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link to="/register" className="action-btn rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 md:px-6" onClick={() => setIsMenuOpen(false)}>
                Đăng ký
              </Link>
              <Link to="/login" className="action-btn rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 md:px-6" onClick={() => setIsMenuOpen(false)}>
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
