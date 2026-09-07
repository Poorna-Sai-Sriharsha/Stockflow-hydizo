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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
        <p className="text-slate-500">Log of all stock movements across the warehouse</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Loading transactions...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No transactions recorded.</td></tr>
              ) : (
                transactions.map((t, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
