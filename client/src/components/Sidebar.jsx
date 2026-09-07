import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, Layers, History, AlertTriangle, Settings, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/items', icon: Box },
    { name: 'Low Stock', path: '/low-stock', icon: AlertTriangle },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-300 h-[calc(100vh-64px)] flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
          <span className="font-bold text-white">Menu</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
