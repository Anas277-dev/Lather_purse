import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { wishlistAPI } from '../services/api.js';
import ProductCard from '../components/product/ProductCard.jsx';

export default function Wishlist() {
  const { data: wishlistItems, isLoading } = useQuery('wishlist', wishlistAPI.getAll, {
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather-700" />
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-stone-300 mb-4" />
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Your Wishlist is Empty</h2>
          <p className="text-stone-500 mb-6">Save items you love to your wishlist.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Explore Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">My Wishlist</h1>
            <p className="text-stone-500">{wishlistItems.length} items saved</p>
          </div>
          <Link to="/shop" className="btn-outline text-sm">
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
