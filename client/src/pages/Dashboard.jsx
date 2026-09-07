import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [itemsRes, transRes] = await Promise.all([
          API.get('/items'),
          API.get('/transactions')
        ]);

        const items = itemsRes.data;
        const transactions = transRes.data;

        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const lowStock = items.filter(item => item.quantity <= item.reorderThreshold).length;

        setStats({
          totalItems: items.length,
          totalValue: totalValue,
          lowStockCount: lowStock,
        });

        setRecentTransactions(transactions.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-slate-500">Real-time status of your inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Items" value={stats.totalItems} color="blue" />
        <StatCard title="Total Stock Value" value={`$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="green" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockCount} color={stats.lowStockCount > 0 ? 'red' : 'slate'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-bold text-slate-800">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 shadow-sm">
              No recent activity
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Qty</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {recentTransactions.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">{t.item?.name}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{t.quantity}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {recentTransactions.map((t, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${t.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{t.item?.name}</p>
                        <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700">{t.quantity}</p>
                      <p className={`text-xs font-medium ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 text-amber-600">
            <AlertCircle size={20} />
            <h2 className="font-bold text-slate-800">Attention Required</h2>
          </div>
          {recentTransactions.length === 0 ? (
             <p className="text-slate-500 text-sm">Everything looks good! No urgent alerts.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">You have {stats.lowStockCount} items below their reorder threshold. Please check the Low Stock tab for details.</p>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-xs font-medium text-amber-800 uppercase">Pro Tip</p>
                <p className="text-sm text-amber-700 mt-1">Updating reorder thresholds helps prevent stockouts during peak seasons.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
