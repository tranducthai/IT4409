import { useState } from 'react';
import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { changePassword } from '../services/api/auth.service';

const roleLabels = {
  STUDENT: 'Sinh viên',
  TEACHER: 'Giảng viên',
  ADMIN: 'Quản trị viên',
};

const initialPasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function getInitials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'TK';
  return words.slice(-2).map((word) => word[0]).join('').toUpperCase();
}

export default function AccountManagementCard({ user }) {
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fullName = user?.full_name ?? user?.name ?? 'Người dùng';
  const role = String(user?.role ?? 'STUDENT').toUpperCase();

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitPassword = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Mật khẩu mới cần có ít nhất 6 ký tự.');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(initialPasswordForm);
      setMessage('Đã cập nhật mật khẩu.');
    } catch (err) {
      setError(err?.message || 'Không đổi được mật khẩu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
            {getInitials(fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
              Quản lý tài khoản
            </p>
            <h2 className="mt-1 break-words text-xl font-bold text-slate-900 dark:text-slate-100">
              {fullName}
            </h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {user?.email ?? 'Chưa cập nhật email'}
              </p>
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                {roleLabels[role] ?? role}
              </p>
              <p className="inline-flex items-center gap-2 break-all">
                <UserRound className="h-4 w-4 flex-shrink-0 text-slate-400" />
                {user?.id ?? 'Chưa có mã người dùng'}
              </p>
            </div>
          </div>
        </div>

        <form
          className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950"
          onSubmit={handleSubmitPassword}
        >
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            Đổi mật khẩu
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Mật khẩu hiện tại"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(event) => handlePasswordChange('oldPassword', event.target.value)}
              required
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Mật khẩu mới"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => handlePasswordChange('newPassword', event.target.value)}
              required
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Xác nhận mật khẩu mới"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => handlePasswordChange('confirmPassword', event.target.value)}
              required
            />
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </section>
  );
}
