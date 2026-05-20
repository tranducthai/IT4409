import { API_BASE_URL } from '../services/api/client';
import { USE_MOCK_DATA } from '../services/dataSource';

export default function DevModeBanner() {
  if (!import.meta.env.DEV) return null;

  const label = USE_MOCK_DATA ? 'DỮ LIỆU MOCK' : 'API THẬT';
  const modeClasses = USE_MOCK_DATA
    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100'
    : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100';

  return (
    <div className={`border-y px-4 py-2 text-center text-xs font-semibold ${modeClasses}`}>
      CHẾ ĐỘ DEV: {label}
      {!USE_MOCK_DATA && <span className="ml-2 font-normal">API: {API_BASE_URL}</span>}
    </div>
  );
}
