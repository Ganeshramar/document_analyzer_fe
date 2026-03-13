import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Upload, LayoutDashboard, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">DocAI Analyzer</span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-all text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
              <Link
                to="/upload"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-all text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:block">Upload</span>
              </Link>

              {/* User info + logout */}
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 hidden md:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
