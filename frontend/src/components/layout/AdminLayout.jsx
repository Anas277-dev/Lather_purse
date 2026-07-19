import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Star, AlertCircle, 
  Image, BarChart3, LogOut, Menu, X 
} from 'lucide-react';
import { useAuthStore } from '../../context/store.js';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
  { path: '/admin/banners', label: 'Banners', icon: Image },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-leather-700 text-white rounded-md"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-stone-900 text-white transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <h1 className="text-xl font-serif font-bold text-gold-400">Admin Panel</h1>
          <p className="text-stone-400 text-sm mt-1">Leather & Goods</p>
        </div>

        <nav className="mt-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
                  ${isActive ? 'bg-leather-700 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-stone-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-stone-200 px-6 py-4 lg:px-8">
          <h2 className="text-xl font-serif font-semibold text-stone-800">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
