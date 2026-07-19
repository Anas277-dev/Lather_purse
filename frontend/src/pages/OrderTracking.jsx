import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { orderAPI } from '../services/api.js';
import { ClipboardCheck, Package, Truck, Home, ArrowLeft, Clock } from 'lucide-react';

const statusSteps = [
  { key: 'order_placed', label: 'Order Placed', icon: ClipboardCheck, description: 'Your order has been received' },
  { key: 'dispatched', label: 'Dispatched', icon: Package, description: 'Your order has been packed and dispatched' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Your order has been delivered' },
];

export default function OrderTracking() {
  const { trackingId } = useParams();

  const { data: order, isLoading } = useQuery(
    ['trackOrder', trackingId],
    () => orderAPI.getByTracking(trackingId),
    { select: (res) => res.data }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather-700" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Order Not Found</h2>
          <p className="text-stone-500 mb-4">We couldn't find an order with tracking ID: {trackingId}</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-stone-600 hover:text-leather-700 mb-8">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="bg-white rounded-xl border border-stone-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Track Your Order</h1>
            <p className="text-stone-500">Tracking ID: <span className="font-mono font-bold text-leather-700">{order.tracking_id}</span></p>
          </div>

          {/* Progress Pipeline */}
          <div className="relative mb-12">
            <div className="absolute top-5 left-0 right-0 h-1 bg-stone-200 -z-10" />
            <div 
              className="absolute top-5 left-0 h-1 bg-leather-700 -z-10 transition-all"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
            <div className="flex justify-between">
              {statusSteps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${
                      isCurrent ? 'bg-leather-700 text-white ring-4 ring-leather-100' :
                      isActive ? 'bg-leather-700 text-white' : 'bg-stone-200 text-stone-400'
                    }`}>
                      <step.icon size={18} />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-leather-50 rounded-lg p-6 text-center">
            <Clock size={24} className="mx-auto text-leather-700 mb-2" />
            <h3 className="font-serif font-bold text-lg text-leather-800 mb-1">
              {statusSteps[currentStepIndex]?.label}
            </h3>
            <p className="text-stone-600">{statusSteps[currentStepIndex]?.description}</p>
          </div>

          {/* Order Details */}
          <div className="mt-8 border-t border-stone-200 pt-8">
            <h3 className="font-semibold text-stone-900 mb-4">Order Details</h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.productTitle}</h4>
                    <p className="text-xs text-stone-500">Color: {item.color} | Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-leather-700">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
              <span className="font-semibold">Total Amount</span>
              <span className="text-xl font-bold text-leather-700">${order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
