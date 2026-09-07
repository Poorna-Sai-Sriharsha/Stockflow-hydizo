import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Account Settings</h1>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Email Address</span>
            </div>
            <span className="text-sm text-slate-600">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Role</span>
            </div>
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${user?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-xs text-slate-400 italic">
            Note: To change your password or role, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
