import React from 'react';
import { useQuery } from 'react-query';
import { DollarSign, ShoppingBag, AlertTriangle, MessageSquare, TrendingUp, Package } from 'lucide-react';
import { analyticsAPI, productAPI } from '../../services/api.js';

export default function AdminDashboard() {
  const { data: stats } = useQuery('dashboardStats', analyticsAPI.getDashboard, {
    select: (res) => res.data,
  });

  const { data: lowStock } = useQuery('lowStock', productAPI.getLowStock, {
    select: (res) => res.data,
  });

  const statCards = [
    { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: Package, color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Open Complaints', value: stats?.openComplaints || 0, icon: MessageSquare, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-stone-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(stats?.lowStockProducts > 0 || (lowStock && lowStock.length > 0)) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Low Stock Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-red-700">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Color</th>
                  <th className="pb-3 font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {lowStock?.slice(0, 5).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-stone-900">{item.title}</td>
                    <td className="py-3 text-stone-600 capitalize">{item.category?.replace('_', ' ')}</td>
                    <td className="py-3 text-stone-600">{item.color}</td>
                    <td className="py-3">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        {item.quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/products" className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow">
          <Package size={24} className="text-leather-700 mb-3" />
          <h4 className="font-semibold text-stone-900">Manage Products</h4>
          <p className="text-sm text-stone-500 mt-1">Add, edit, or remove products</p>
        </a>
        <a href="/admin/orders" className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow">
          <ShoppingBag size={24} className="text-leather-700 mb-3" />
          <h4 className="font-semibold text-stone-900">Manage Orders</h4>
          <p className="text-sm text-stone-500 mt-1">Update order statuses</p>
        </a>
        <a href="/admin/analytics" className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow">
          <TrendingUp size={24} className="text-leather-700 mb-3" />
          <h4 className="font-semibold text-stone-900">View Analytics</h4>
          <p className="text-sm text-stone-500 mt-1">Sales and performance data</p>
        </a>
      </div>
    </div>
  );
}
