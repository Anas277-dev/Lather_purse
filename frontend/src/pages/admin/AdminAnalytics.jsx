import React from 'react';
import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Palette } from 'lucide-react';
import { analyticsAPI } from '../../services/api.js';

const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C'];

export default function AdminAnalytics() {
  const { data: revenueData } = useQuery('revenue', analyticsAPI.getRevenue, {
    select: (res) => res.data,
  });

  const { data: categoryData } = useQuery('categories', analyticsAPI.getCategories, {
    select: (res) => res.data,
  });

  const { data: colorData } = useQuery('colors', analyticsAPI.getColors, {
    select: (res) => res.data,
  });

  const { data: stats } = useQuery('dashboardStats', analyticsAPI.getDashboard, {
    select: (res) => res.data,
  });

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leather-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-leather-700" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Revenue</p>
              <p className="text-xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Orders</p>
              <p className="text-xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette size={20} className="text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Low Stock Items</p>
              <p className="text-xl font-bold">{stats?.lowStockProducts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-leather-700" />
          Monthly Revenue
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#8B4513" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sales */}
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="font-bold text-stone-900 mb-6">Sales by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="category"
                >
                  {(categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {(categoryData || []).map((entry, index) => (
              <div key={entry.category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-stone-600 capitalize">{entry.category?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color Preferences */}
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="font-bold text-stone-900 mb-6">Popular Colors</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colorData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="color" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#D2691E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
