import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pt-16 pb-12 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">7Study</span>
        </div>

        <div className="space-y-5">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Contact Us</h4>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300"><Phone size={18}/> 024 3869 2242</div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300"><Mail size={18}/> contact@soict.hust.edu.vn</div>
          <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
            <MapPin size={20} className="mt-1 shrink-0"/> 
            <span>EdTech Centre, tầng 9 nhà B1 - Đại học Bách khoa Hà Nội, Số 1 Đại Cồ Việt - Hai Bà Trưng - Hà Nội</span>
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