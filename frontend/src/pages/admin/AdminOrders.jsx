import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Package, Truck, Home, ClipboardCheck, Download } from 'lucide-react';
import { orderAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'order_placed', label: 'Order Placed', icon: ClipboardCheck },
  { value: 'dispatched', label: 'Dispatched', icon: Package },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: Home },
];

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery(
    ['adminOrders', statusFilter],
    () => orderAPI.getAll({ status: statusFilter }),
    { select: (res) => res.data }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => orderAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        toast.success('Order status updated');
      },
    }
  );

  const downloadInvoice = async (orderId) => {
    try {
      const response = await orderAPI.generateInvoice(orderId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      link.click();
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-900">Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Tracking ID</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Customer</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Items</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Total</th>
                <th className="px-6 py-4 text-left font-medium text-stone-700">Status</th>
                <th className="px-6 py-4 text-right font-medium text-stone-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-mono font-bold text-leather-700">{order.tracking_id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.first_name} {order.last_name}</p>
                    <p className="text-xs text-stone-500">{order.email}</p>
                  </td>
                  <td className="px-6 py-4"><p className="text-sm">{order.items?.length} items</p></td>
                  <td className="px-6 py-4 font-bold">${order.total_amount}</td>
                  <td className="px-6 py-4">
                    <select value={order.status} onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })} className="text-sm border border-stone-300 rounded px-2 py-1">
                      {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => downloadInvoice(order.id)} className="text-stone-400 hover:text-leather-700" title="Download Invoice"><Download size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
