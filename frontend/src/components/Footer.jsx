import { Phone, Mail, MapPin } from 'lucide-react';
import graduationCapIcon from '../assets/graduation-cap.svg';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pt-16 pb-12 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-12 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-sm">
            <img
              src={graduationCapIcon}
              alt="7Study"
              className="h-7 w-7 object-contain brightness-0 invert"
            />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-800 dark:text-slate-100">
              7Study
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Không gian học tập cho lớp học hiện đại
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Liên hệ</h4>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300"><Phone size={18}/> 1900 777 123</div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300"><Mail size={18}/> hello@7study.vn</div>
          <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
            <MapPin size={20} className="mt-1 shrink-0"/> 
            <span>7Study Campus, Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
          </div>
        </div>

        <div className="relative rounded-2xl bg-indigo-50 p-6 italic text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <span className="text-4xl text-indigo-200 absolute top-2 left-2">“</span>
          <p className="relative z-10 py-4 px-4 text-center">Cùng kiến tạo tương lai số với những cơ sở giáo dục hàng đầu Việt Nam</p>
          <span className="text-4xl text-indigo-200 absolute bottom-2 right-2 rotate-180">“</span>
        </div>
      </div>
    </footer>
  );
}
