import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { productAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const categories = [
  { value: 'men_purse', label: "Men's Purse" },
  { value: 'ladies_purse', label: "Ladies' Purse" },
  { value: 'gents_belt', label: "Gents' Belt" },
];

const initialProduct = {
  title: '',
  description: '',
  oldPrice: '',
  newPrice: '',
  category: 'men_purse',
  images: ['', '', '', ''],
  variants: [{ color: '', colorHex: '#000000', quantity: 0 }],
  isFlashSale: false,
  flashSaleEnd: '',
};

export default function AdminProducts() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialProduct);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery('adminProducts', () => productAPI.getAll({ limit: 100 }), {
    select: (res) => res.data.products,
  });

  const createMutation = useMutation(productAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminProducts');
      toast.success('Product created');
      setShowModal(false);
      setFormData(initialProduct);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation(
    (data) => productAPI.update(editingProduct.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success('Product updated');
        setShowModal(false);
        setEditingProduct(null);
        setFormData(initialProduct);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
    }
  );

  const deleteMutation = useMutation(productAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminProducts');
      toast.success('Product deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      oldPrice: parseFloat(formData.oldPrice) || null,
      newPrice: parseFloat(formData.newPrice),
      variants: formData.variants.filter(v => v.color && v.quantity >= 0),
    };

    if (editingProduct) {
      updateMutation.mutate({ ...payload, isActive: true });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      oldPrice: product.old_price || '',
      newPrice: product.new_price,
      category: product.category,
      images: product.images || ['', '', '', ''],
      variants: product.variants?.length > 0 ? product.variants : [{ color: '', colorHex: '#000000', quantity: 0 }],
      isFlashSale: product.is_flash_sale || false,
      flashSaleEnd: product.flash_sale_end ? new Date(product.flash_sale_end).toISOString().slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { color: '', colorHex: '#000000', quantity: 0 }],
    });
  };

  const updateVariant = (idx, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[idx][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (idx) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-900">Products</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData(initialProduct);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Product</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Category</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Price</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Variants</th>
                <th className="px-6 py-4 text-right font-medium text-stone-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]} alt={product.title} className="w-12 h-12 object-cover rounded" />
                      <span className="font-medium text-stone-900">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{product.category?.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-leather-700">${product.new_price}</span>
                    {product.old_price && (
                      <span className="text-stone-400 line-through ml-2">${product.old_price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {product.variants?.map((v) => (
                        <span
                          key={v.id}
                          className={`w-4 h-4 rounded-full border border-stone-300 ${v.quantity === 0 ? 'opacity-40' : ''}`}
                          style={{ backgroundColor: v.color_hex }}
                          title={`${v.color}: ${v.quantity}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(product)} className="text-stone-400 hover:text-leather-700 mr-3">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteMutation.mutate(product.id)} className="text-stone-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Old Price</label>
                  <input type="number" step="0.01" value={formData.oldPrice} onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">New Price *</label>
                  <input type="number" step="0.01" required value={formData.newPrice} onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Images (4 URLs)</label>
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((img, idx) => (
                    <input key={idx} type="url" placeholder={`Image ${idx + 1} URL`} value={img} onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[idx] = e.target.value;
                      setFormData({ ...formData, images: newImages });
                    }} className="input-field text-sm" />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-stone-700">Color Variants</label>
                  <button type="button" onClick={addVariant} className="text-sm text-leather-700 hover:underline">+ Add Variant</button>
                </div>
                <div className="space-y-2">
                  {formData.variants.map((variant, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input type="text" placeholder="Color name" value={variant.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} className="input-field flex-1 text-sm" />
                      <input type="color" value={variant.colorHex} onChange={(e) => updateVariant(idx, 'colorHex', e.target.value)} className="w-10 h-10 rounded border border-stone-300" />
                      <input type="number" placeholder="Qty" value={variant.quantity} onChange={(e) => updateVariant(idx, 'quantity', e.target.value)} className="input-field w-24 text-sm" />
                      {formData.variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(idx)} className="text-red-500"><X size={18} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isFlashSale} onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm">Flash Sale</span>
                </label>
                {formData.isFlashSale && (
                  <input type="datetime-local" value={formData.flashSaleEnd} onChange={(e) => setFormData({ ...formData, flashSaleEnd: e.target.value })} className="input-field text-sm" />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">{editingProduct ? 'Update' : 'Create'} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
