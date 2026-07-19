import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ClipboardCheck } from 'lucide-react';

export default function OrderConfirmation() {
  const { trackingId } = useParams();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Order Confirmed!</h1>
        <p className="text-stone-500 mb-6">Thank you for your purchase. Your order has been received.</p>

        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-stone-500">Tracking ID</span>
            <span className="font-mono font-bold text-leather-700">{trackingId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Estimated Delivery</span>
            <span className="font-medium">3-5 Business Days</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: ClipboardCheck, label: 'Placed', active: true },
            { icon: Package, label: 'Packed', active: false },
            { icon: Truck, label: 'Shipped', active: false },
            { icon: Home, label: 'Delivered', active: false },
          ].map((step) => (
            <div key={step.label} className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                step.active ? 'bg-leather-700 text-white' : 'bg-stone-200 text-stone-400'
              }`}>
                <step.icon size={18} />
              </div>
              <span className="text-xs text-stone-500">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link to={`/track/${trackingId}`} className="block w-full btn-primary">
            Track Your Order
          </Link>
          <Link to="/shop" className="block w-full btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
