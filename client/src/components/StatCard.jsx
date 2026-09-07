import React from 'react';

const StatCard = ({ title, value, subtext, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    slate: 'text-slate-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${colorMap[color] || colorMap.slate}`}>{value}</span>
        {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
      </div>
    </div>
  );
};

export default StatCard;
