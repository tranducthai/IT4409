import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (!panelRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
        className="action-btn relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Thông báo</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                <CheckCheck size={14} />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-400">Không có thông báo</li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0 dark:border-slate-800 ${
                  n.is_read ? '' : 'bg-indigo-50/60 dark:bg-indigo-500/5'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {n.link ? (
                    <Link
                      to={n.link}
                      onClick={() => { if (!n.is_read) markAsRead(n.id); setOpen(false); }}
                      className="block"
                    >
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                    </>
                  )}
                </div>
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    aria-label="Đánh dấu đã đọc"
                    className="mt-0.5 shrink-0 text-indigo-400 hover:text-indigo-600"
                  >
                    <Check size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
