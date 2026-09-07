import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Download, Upload } from 'lucide-react';

const Items = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('name:asc');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', quantity: 0, unitPrice: 0, supplier: '', reorderThreshold: 10 });

  useEffect(() => {
    fetchData();
  }, [search, category, sort]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        API.get(`/items?search=${search}&category=${category}&sort=${sort}`),
        API.get('/categories')
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await API.put(`/items/${editingItem._id}`, formData);
      } else {
        await API.post('/items', formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', sku: '', category: '', quantity: 0, unitPrice: 0, supplier: '', reorderThreshold: 10 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await API.delete(`/items/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting item');
      }
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await API.get('/items/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_audit.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error exporting items');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await API.post('/items/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(data.message);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error importing items');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="hidden sm:block text-slate-500">Manage your products and stock levels</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.role === 'admin' && (
            <>
              <label className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer text-sm">
                <Upload size={18} /> <span className="hidden sm:inline">Import CSV</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
              >
                <Download size={18} /> <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', sku: '', category: '', quantity: 0, unitPrice: 0, supplier: '', reorderThreshold: 10 });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus size={20} /> <span className="hidden sm:inline">Add Item</span>
              </button>
            </>
          )}
        </div>
      </div>


      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pl-10"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pl-10 appearance-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="quantity:asc">Qty (Low-High)</option>
            <option value="quantity:desc">Qty (High-Low)</option>
            <option value="unitPrice:asc">Price (Low-High)</option>
            <option value="unitPrice:desc">Price (High-Low)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading inventory...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No items found.</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.category?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${item.quantity <= item.reorderThreshold ? 'text-red-600' : 'text-slate-700'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/items/${item._id}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View Details">
                          <Eye size={18} />
                        </Link>
                        {user?.role === 'admin' && (
                          <>
                            <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {items.map((item) => (
              <div key={item._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono text-slate-400">{item.sku}</p>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-xs text-slate-500">{item.category?.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {user?.role === 'admin' && (
                      <>
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-amber-600">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    <Link to={`/items/${item._id}`} className="p-2 text-slate-400 hover:text-blue-600">
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Quantity</span>
                    <span className={`text-lg font-bold ${item.quantity <= item.reorderThreshold ? 'text-red-600' : 'text-slate-700'}`}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-500">Unit Price</span>
                    <span className="text-lg font-medium text-slate-700">${item.unitPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU/Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.reorderThreshold}
                    onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-secondary">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
