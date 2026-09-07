import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <Package className="text-blue-600" />
          <span className="hidden sm:inline">StockFlow</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 mr-4">
          <User size={16} />
          <span className="font-medium">{user?.name} ({user?.role})</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-secondary text-sm py-1.5"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
