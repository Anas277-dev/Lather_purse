import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Pencil, Trash2, X, Image } from 'lucide-react';
import { settingsAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const initialBanner = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  displayOrder: 0,
};

export default function AdminBanners() {
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState(initialBanner);
  const [offerBarText, setOfferBarText] = useState('');
  const [offerBarActive, setOfferBarActive] = useState(false);
  const queryClient = useQueryClient();

  const { data: banners } = useQuery('allBanners', settingsAPI.getAllBanners, {
    select: (res) => res.data,
  });

  const { data: settings } = useQuery('siteSettings', settingsAPI.get, {
    select: (res) => res.data,
    onSuccess: (data) => {
      setOfferBarText(data?.offer_bar_text || '');
      setOfferBarActive(data?.offer_bar_active || false);
    },
  });

  const createMutation = useMutation(settingsAPI.createBanner, {
    onSuccess: () => {
      queryClient.invalidateQueries('allBanners');
      toast.success('Banner created');
      setShowModal(false);
      setFormData(initialBanner);
    },
  });

  const updateMutation = useMutation(
    (data) => settingsAPI.updateBanner(editingBanner.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allBanners');
        toast.success('Banner updated');
        setShowModal(false);
        setEditingBanner(null);
        setFormData(initialBanner);
      },
    }
  );

  const deleteMutation = useMutation(settingsAPI.deleteBanner, {
    onSuccess: () => {
      queryClient.invalidateQueries('allBanners');
      toast.success('Banner deleted');
    },
  });

  const settingsMutation = useMutation(settingsAPI.update, {
    onSuccess: () => {
      queryClient.invalidateQueries('siteSettings');
      toast.success('Settings updated');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBanner) {
      updateMutation.mutate({ ...formData, isActive: true });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      displayOrder: banner.display_order,
    });
    setShowModal(true);
  };

  const handleSettingsSave = () => {
    settingsMutation.mutate({
      offerBarText,
      offerBarActive,
      whatsappNumber: settings?.whatsapp_number || '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Site Settings */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Site Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Offer Bar Text</label>
            <input
              type="text"
              value={offerBarText}
              onChange={(e) => setOfferBarText(e.target.value)}
              className="input-field"
              placeholder="e.g., Free shipping on orders over $100"
            />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offerBarActive}
                onChange={(e) => setOfferBarActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Offer Bar</span>
            </label>
            <button onClick={handleSettingsSave} className="btn-primary text-sm py-2 px-4">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Banners */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-stone-900">Hero Banners</h3>
          <button
            onClick={() => {
              setEditingBanner(null);
              setFormData(initialBanner);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners?.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              <div className="aspect-video relative">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-medium text-stone-900">{banner.title}</h4>
                <p className="text-xs text-stone-500 mt-1">Order: {banner.display_order}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(banner)} className="p-2 text-stone-400 hover:text-leather-700">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(banner.id)} className="p-2 text-stone-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingBanner ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                <input type="url" required value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Link URL</label>
                <input type="text" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="input-field" placeholder="/shop" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Display Order</label>
                <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} className="input-field" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">{editingBanner ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
