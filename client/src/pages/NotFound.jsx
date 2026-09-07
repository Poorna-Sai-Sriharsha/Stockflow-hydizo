import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Package size={64} className="text-slate-300" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-slate-500 mb-8">Oops! The page you're looking for has gone missing.</p>
        <Link to="/" className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-primary">Return to Dashboard</Link>
      </div>
    </div>
  );
};

export default NotFound;
