import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './context/store.js';
import { authAPI } from './services/api.js';
import toast from 'react-hot-toast';

// Lazy load all pages for faster initial load
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'));
const OrderTracking = lazy(() => import('./pages/OrderTracking.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews.jsx'));
const AdminComplaints = lazy(() => import('./pages/admin/AdminComplaints.jsx'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners.jsx'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics.jsx'));

// Layouts (load immediately - needed for skeleton)
import MainLayout from './components/layout/MainLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-leather-200 border-t-leather-700 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-stone-500 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  const { initialize, login, logout } = useAuthStore();

  React.useEffect(() => {
    initialize();
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(res => login(res.data, token))
        .catch(() => {
          logout();
          toast.error('Session expired. Please login again.');
        });
    }
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/track/:trackingId" element={<OrderTracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:trackingId" element={<OrderConfirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
