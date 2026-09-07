import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Categories = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await API.put(`/categories/${editingCat._id}`, formData);
      } else {
        await API.post('/categories', formData);
      }
      setIsModalOpen(false);
      setEditingCat(null);
      setFormData({ name: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This category might be used by items.')) {
      try {
        await API.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm md:text-base text-slate-500">Organize your inventory into groups</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingCat(null);
              setFormData({ name: '' });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Add Category</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No categories found.</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3">Category Name</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {categories.map(cat => (
                  <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCat(cat);
                                setFormData({ name: cat.name });
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
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
            {categories.map(cat => (
              <div key={cat._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex justify-between items-center">
                <span className="font-medium text-slate-800">{cat.name}</span>
                <div className="flex gap-2">
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setFormData({ name: cat.name });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded font-medium transition-colors duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded font-medium transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
