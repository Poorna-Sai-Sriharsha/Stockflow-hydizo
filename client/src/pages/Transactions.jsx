import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await API.get('/transactions');
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Transaction History</h1>
        <p className="text-sm md:text-base text-slate-500">Log of all stock movements across the warehouse</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No transactions recorded.</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Note</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{t.item?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.quantity}</td>
                    <td className="px-6 py-4 text-slate-600">{t.user?.name}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{t.note || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/items/${t.item?._id}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {transactions.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${t.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <h3 className="font-bold text-slate-800">{t.item?.name}</h3>
                  </div>
                  <Link to={`/items/${t.item?._id}`} className="p-2 text-slate-400 hover:text-blue-600">
                    <Eye size={18} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-slate-100 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Quantity</span>
                    <span className="font-medium text-slate-700">{t.quantity}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-500">Date</span>
                    <span className="font-medium text-slate-700">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">User</span>
                    <span className="font-medium text-slate-700">{t.user?.name}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-500">Type</span>
                    <span className={`font-medium ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</span>
                  </div>
                </div>
                {t.note && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Note: </span>
                    <span className="text-xs text-slate-600 italic">{t.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Transactions;
