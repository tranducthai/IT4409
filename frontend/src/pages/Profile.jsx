import { useRef, useState } from 'react';
import { Camera, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '../services/api/session';
import { updateCurrentUserProfile, uploadUserAvatar } from '../services/api/users.service';
import { USE_MOCK_DATA } from '../services/dataSource';

const roleLabels = {
  STUDENT: 'Sinh viên',
  TEACHER: 'Giảng viên',
  ADMIN: 'Quản trị viên',
};

function getInitials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'TK';
  return words.slice(-2).map((word) => word[0]).join('').toUpperCase();
}

export default function Profile() {
  const currentUser = getCurrentUser();
  const [form, setForm] = useState({
    full_name: currentUser?.full_name ?? currentUser?.name ?? '',
  });
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url ?? '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const role = String(currentUser?.role ?? 'STUDENT').toUpperCase();
  const displayName = form.full_name.trim() || 'Người dùng';

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.full_name.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }

    setIsSaving(true);
    try {
      if (USE_MOCK_DATA) {
        setCurrentUser({ ...currentUser, full_name: form.full_name.trim() });
      } else {
        if (avatarFile) {
          await uploadUserAvatar(currentUser.id, avatarFile);
          setAvatarFile(null);
        }
        await updateCurrentUserProfile(currentUser.id, {
          full_name: form.full_name.trim(),
          avatar_url: avatarFile ? undefined : (avatarUrl || null),
        });
      }
      setMessage('Đã cập nhật hồ sơ.');
    } catch (err) {
      setError(err?.message || 'Không cập nhật được hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
          Hồ sơ cá nhân
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
          Thông tin người dùng
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cập nhật tên hiển thị và ảnh đại diện dùng trong hệ thống.
        </p>
      </div>

      <section className="grid gap-6 text-left lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
              title="Đổi ảnh đại diện"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-24 w-24 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
                  {getInitials(displayName)}
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <h2 className="mt-4 break-words text-xl font-bold text-slate-900 dark:text-slate-100">
              {displayName}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {roleLabels[role] ?? role}
            </p>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="min-w-0 truncate">{currentUser?.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              {roleLabels[role] ?? role}
            </p>
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="min-w-0 break-all">{currentUser?.id}</span>
            </p>
          </div>
        </aside>

        <form
          className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="profile-name" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Họ và tên
            </label>
            <input
              id="profile-name"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={form.full_name}
              onChange={(event) => handleChange('full_name', event.target.value)}
              required
            />
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Camera className="h-4 w-4" />
              Ảnh đại diện
            </label>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Chọn ảnh...
              </button>
              <span className="truncate text-sm text-slate-400">
                {avatarFile ? avatarFile.name : 'Chưa chọn ảnh'}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                value={currentUser?.email ?? ''}
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Vai trò</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                value={roleLabels[role] ?? role}
                disabled
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="action-btn inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-fit"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </form>
      </section>
    </main>
  );
}
