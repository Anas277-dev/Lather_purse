import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../context/store.js';
import { useCartStore } from '../../context/store.js';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop All' },
    { to: '/shop/men_purse', label: "Men's Purses" },
    { to: '/shop/ladies_purse', label: "Ladies' Purses" },
    { to: '/shop/gents_belt', label: "Gents' Belts" },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl lg:text-2xl font-serif font-bold text-leather-700">Leather</span>
            <span className="text-xl lg:text-2xl font-serif font-light text-stone-500">&</span>
            <span className="text-xl lg:text-2xl font-serif font-bold text-leather-700">Goods</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-stone-600 hover:text-leather-700 font-medium transition-colors text-sm uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 lg:w-64 pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-leather-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              </div>
            </form>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="p-2 text-stone-600 hover:text-leather-700 transition-colors relative">
                    <Heart size={20} />
                  </Link>
                  <Link to="/cart" className="p-2 text-stone-600 hover:text-leather-700 transition-colors relative">
                    <ShoppingBag size={20} />
                    {getItemCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-leather-700 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {getItemCount()}
                      </span>
                    )}
                  </Link>
                  <div className="relative group">
                    <button className="p-2 text-stone-600 hover:text-leather-700 transition-colors">
                      <User size={20} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="p-3 border-b border-stone-100">
                        <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-stone-500">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">My Profile</Link>
                      <Link to="/profile?tab=orders" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">My Orders</Link>
                      {user?.isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-leather-700 hover:bg-stone-50 font-medium">Admin Panel</Link>
                      )}
                      <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-50">
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link to="/cart" className="p-2 text-stone-600 hover:text-leather-700 relative">
                <ShoppingBag size={22} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-leather-700 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-600 hover:text-leather-700"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={closeMenu}
          />

          {/* Sidebar */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <span className="font-serif font-bold text-lg text-leather-700">Menu</span>
              <button onClick={closeMenu} className="p-2 text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-stone-200">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leather-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                </div>
              </form>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="flex items-center justify-between px-5 py-4 text-stone-700 hover:bg-stone-50 border-b border-stone-100 font-medium"
                >
                  {link.label}
                  <ChevronRight size={16} className="text-stone-400" />
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <Link to="/wishlist" onClick={closeMenu} className="flex items-center gap-3 px-5 py-4 text-stone-700 hover:bg-stone-50 border-b border-stone-100">
                    <Heart size={18} />
                    <span>My Wishlist</span>
                  </Link>
                  <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 px-5 py-4 text-stone-700 hover:bg-stone-50 border-b border-stone-100">
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/profile?tab=orders" onClick={closeMenu} className="flex items-center gap-3 px-5 py-4 text-stone-700 hover:bg-stone-50 border-b border-stone-100">
                    <ShoppingBag size={18} />
                    <span>My Orders</span>
                  </Link>
                  {user?.isAdmin && (
                    <Link to="/admin" onClick={closeMenu} className="flex items-center gap-3 px-5 py-4 text-leather-700 hover:bg-stone-50 border-b border-stone-100 font-medium">
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Bottom: Sign In / User */}
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-leather-100 rounded-full flex items-center justify-center text-leather-700 font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-stone-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-stone-500 text-center">Sign in to access your account</p>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full text-center btn-primary py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block w-full text-center btn-outline py-3"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
