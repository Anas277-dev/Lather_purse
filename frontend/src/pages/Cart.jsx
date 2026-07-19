import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../context/store.js';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-stone-300 mb-4" />
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Your Cart is Empty</h2>
          <p className="text-stone-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-lg border border-stone-200 p-4 flex gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-500 mt-1">Color: {item.color}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-8 h-8 border border-stone-300 rounded flex items-center justify-center hover:bg-stone-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-8 h-8 border border-stone-300 rounded flex items-center justify-center hover:bg-stone-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-leather-700">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => {
                          removeItem(item.productId, item.variantId);
                          toast.success('Item removed');
                        }}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="text-sm text-stone-500 hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
              <h3 className="font-serif font-bold text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Shipping</span>
                  <span className="font-medium">{getTotal() >= 100 ? 'Free' : '$9.99'}</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="font-bold text-lg text-leather-700">
                    ${(getTotal() + (getTotal() >= 100 ? 0 : 9.99)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <Link to="/shop" className="block text-center text-sm text-leather-700 mt-4 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
