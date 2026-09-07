import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Package } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txFormData, setTxFormData] = useState({ quantity: 0, note: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const fetchItemData = async () => {
    try {
      const [itemRes, txRes] = await Promise.all([
        API.get(`/items/${id}`),
        API.get(`/transactions/item/${id}`)
      ]);
      setItem(itemRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Error fetching item details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async (type) => {
    if (txFormData.quantity <= 0) return alert('Quantity must be greater than 0');
    try {
      await API.post('/transactions', {
        itemId: id,
        type,
        quantity: txFormData.quantity,
        note: txFormData.note
      });
      setTxFormData({ quantity: 0, note: '' });
      fetchItemData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stock');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading item details...</div>;
  if (!item) return <div className="p-8 text-center text-slate-500">Item not found.</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/items')} className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-secondary w-auto px-3 py-2">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Item Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Package size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-800">{item.name}</h2>
                <p className="text-sm text-slate-500 font-mono">{item.sku}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-800">{item.category?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Quantity</span>
                <span className={`font-bold ${item.quantity <= item.reorderThreshold ? 'text-red-600' : 'text-slate-800'}`}>
                  {item.quantity}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Unit Price</span>
                <span className="font-medium text-slate-800">${item.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Supplier</span>
                <span className="font-medium text-slate-800">{item.supplier || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Reorder Threshold</span>
                <span className="font-medium text-slate-800">{item.reorderThreshold}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 bg-slate-50 border-dashed border-2 border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Quick Stock Adjustment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={txFormData.quantity}
                  onChange={(e) => setTxFormData({ ...txFormData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Note (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={txFormData.note}
                  onChange={(e) => setTxFormData({ ...txFormData, note: e.target.value })}
                  placeholder="e.g. Monthly restock"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStockChange('IN')}
                  className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-primary bg-green-600 hover:bg-green-700"
                >
                  <ArrowUpCircle size={18} /> Stock In
                </button>
                <button
                  onClick={() => handleStockChange('OUT')}
                  className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-primary bg-red-600 hover:bg-red-700"
                >
                  <ArrowDownCircle size={18} /> Stock Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">Transaction History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Note</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {transactions.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No transaction history available.</td></tr>
                  ) : (
                    transactions.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{t.quantity}</td>
                        <td className="px-6 py-4 text-slate-600">{t.user?.name}</td>
                        <td className="px-6 py-4 text-slate-500 italic">{t.note || '-'}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
