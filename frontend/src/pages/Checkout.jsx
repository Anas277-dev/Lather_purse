import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCartStore, useAuthStore } from '../context/store.js';
import { orderAPI } from '../services/api.js';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, label: 'Review', icon: Check },
  { id: 2, label: 'Shipping', icon: MapPin },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Confirm', icon: Check },
];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingData, setShippingData] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'USA'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.defaultAddress) {
      setShippingData(prev => ({ ...prev, ...user.defaultAddress }));
    }
    if (user) {
      setShippingData(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email
      }));
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const res = await orderAPI.create({
        items: orderItems,
        shippingAddress: shippingData,
        paymentMethod
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${res.data.order.trackingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const shippingCost = getTotal() >= 100 ? 0 : 9.99;
  const total = getTotal() + shippingCost;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg">Review Your Cart</h3>
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 bg-stone-50 p-4 rounded-lg">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-stone-500">Color: {item.color} | Qty: {item.quantity}</p>
                  <p className="font-medium text-leather-700 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-leather-700">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg">Shipping Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingData.fullName}
                  onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={shippingData.email}
                  onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  className="input-field"
                  placeholder="Street address, apartment, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={shippingData.postalCode}
                  onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg">Payment Method</h3>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'cod' ? 'border-leather-700 bg-leather-50' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-leather-700"
                />
                <Truck size={24} className="text-stone-600" />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-stone-500">Pay when your order arrives</p>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-leather-700 bg-leather-50' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-leather-700"
                />
                <CreditCard size={24} className="text-stone-600" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-stone-500">Secure online payment</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg">Confirm Order</h3>
            <div className="bg-stone-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-stone-900 mb-2">Shipping To:</h4>
                <p className="text-sm text-stone-600">{shippingData.fullName}</p>
                <p className="text-sm text-stone-600">{shippingData.address}</p>
                <p className="text-sm text-stone-600">{shippingData.city}, {shippingData.postalCode}</p>
                <p className="text-sm text-stone-600">{shippingData.phone}</p>
              </div>
              <div className="border-t border-stone-200 pt-4">
                <h4 className="font-medium text-stone-900 mb-2">Payment:</h4>
                <p className="text-sm text-stone-600 capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}</p>
              </div>
              <div className="border-t border-stone-200 pt-4">
                <h4 className="font-medium text-stone-900 mb-2">Order Total:</h4>
                <p className="text-2xl font-bold text-leather-700">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title text-center mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive ? 'bg-leather-700 text-white' :
                    isCompleted ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-leather-700' : 'text-stone-500'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-stone-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
              >
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={18} /> Place Order
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
