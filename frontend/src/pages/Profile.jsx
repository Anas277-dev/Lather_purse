import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { User, ShoppingBag, Star, AlertCircle, MapPin, LogOut, Package, Truck, Home, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '../context/store.js';
import { authAPI, orderAPI, reviewAPI, complaintAPI } from '../services/api.js';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'reviews', label: 'My Reviews', icon: Star },
  { id: 'complaints', label: 'Complaints', icon: AlertCircle },
];

const statusIcons = {
  order_placed: ClipboardCheck,
  dispatched: Package,
  out_for_delivery: Truck,
  delivered: Home,
};

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const { user, logout, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    defaultAddress: user?.defaultAddress || {}
  });

  const { data: orders } = useQuery('myOrders', orderAPI.getMyOrders, {
    select: (res) => res.data,
    enabled: activeTab === 'orders',
  });

  const { data: complaints } = useQuery('myComplaints', complaintAPI.getMyComplaints, {
    select: (res) => res.data,
    enabled: activeTab === 'complaints',
  });

  const handleUpdateProfile = async () => {
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">Personal Information</h3>
              <button
                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                className="text-sm text-leather-700 font-medium hover:underline"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Default Address</label>
                  <textarea
                    value={JSON.stringify(formData.defaultAddress)}
                    onChange={(e) => setFormData({ ...formData, defaultAddress: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
                  <div className="w-16 h-16 bg-leather-100 rounded-full flex items-center justify-center text-leather-700 text-xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">{user?.firstName} {user?.lastName}</h4>
                    <p className="text-stone-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-500 mb-1">Phone</p>
                    <p className="font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-500 mb-1">Default Address</p>
                    <p className="font-medium">{user?.defaultAddress ? 'Saved' : 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg">Order History</h3>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Package;
                return (
                  <div key={order.id} className="bg-white border border-stone-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-leather-700">{order.tracking_id}</p>
                        <p className="text-xs text-stone-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-leather-50 rounded-full">
                        <StatusIcon size={14} className="text-leather-700" />
                        <span className="text-sm font-medium text-leather-700 capitalize">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.productTitle}</p>
                            <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center">
                      <span className="font-bold">${order.total_amount}</span>
                      <a href={`/track/${order.tracking_id}`} className="text-sm text-leather-700 hover:underline">
                        Track Order
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
                <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500">No orders yet</p>
              </div>
            )}
          </div>
        );

      case 'complaints':
        return (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg">My Complaints</h3>
            {complaints && complaints.length > 0 ? (
              complaints.map((complaint) => (
                <div key={complaint.id} className="bg-white border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-stone-500">Order: {complaint.tracking_id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      complaint.status === 'open' ? 'bg-red-100 text-red-700' :
                      complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {complaint.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1">{complaint.subject}</h4>
                  <p className="text-sm text-stone-600">{complaint.description}</p>
                  {complaint.admin_reply && (
                    <div className="mt-3 p-3 bg-leather-50 rounded-lg">
                      <p className="text-xs font-medium text-leather-700 mb-1">Admin Reply:</p>
                      <p className="text-sm text-stone-600">{complaint.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
                <AlertCircle size={48} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500">No complaints filed</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-stone-200 p-4 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b border-stone-200">
                <div className="w-16 h-16 bg-leather-100 rounded-full flex items-center justify-center text-leather-700 text-xl font-bold mx-auto mb-3">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h3 className="font-medium">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-stone-500">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-leather-50 text-leather-700'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
