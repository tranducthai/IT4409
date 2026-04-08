import { useState } from 'react';
import { GraduationCap, User, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); 

  
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="flex justify-between items-center px-12 py-3 bg-white border-b sticky top-0 z-50">
      
      <Link to="/" className="flex items-center gap-2">
        <GraduationCap className="text-indigo-600" size={30} />
        <span className="text-2xl font-bold text-indigo-900">Daotao.ai</span>
      </Link>

      <div className="flex items-center gap-6">
        {isDashboard ? (
         
          <div className="flex items-center gap-6 relative">
            <span className="font-medium text-gray-700">My Courses</span>
            
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
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Resume last course</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Dashboard</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Profile</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer">Account</div>
                <Link to="/" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t mt-1">
                  Sign Out
                </Link>
              </div>
            )}
          </div>
        ) : (
       
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-indigo-700 text-white rounded-md font-semibold hover:bg-indigo-800 transition">
              Register
            </button>
            <Link to="/dashboard" className="px-6 py-2 bg-indigo-500 text-white rounded-md font-semibold hover:bg-indigo-600 transition">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}