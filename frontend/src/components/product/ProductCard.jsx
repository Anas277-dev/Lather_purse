import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { useWishlistStore } from '../../context/store.js';
import { wishlistAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (inWishlist) {
        await wishlistAPI.remove(product.id);
        toggleItem(product.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        toggleItem(product.id);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Please login to use wishlist');
    }
  };

  const displayImage = hoveredColor !== null && product.images[hoveredColor] 
    ? product.images[hoveredColor] 
    : product.images[0];

  const discount = product.old_price 
    ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100) 
    : 0;

  return (
    <div className="card group">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/5] bg-stone-100 relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-stone-200 animate-pulse" />
          )}
          <img
            src={displayImage}
            alt={product.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.is_flash_sale && new Date(product.flash_sale_end) > new Date() && (
            <span className="bg-leather-700 text-white text-xs font-bold px-2 py-1 rounded flash-sale-badge">
              FLASH SALE
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full shadow-md transition-colors ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white text-stone-600 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="p-2 rounded-full bg-white text-stone-600 hover:text-leather-700 shadow-md"
          >
            <Eye size={16} />
          </Link>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-stone-900 mb-1 line-clamp-1 hover:text-leather-700 transition-colors">
            {product.title}
          </h3>
        </Link>

        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {product.variants.map((variant, idx) => (
              <button
                key={variant.id}
                onMouseEnter={() => setHoveredColor(idx)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  variant.quantity === 0 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{ 
                  backgroundColor: variant.colorHex || '#ccc',
                  borderColor: hoveredColor === idx ? '#8B4513' : '#e5e5e5'
                }}
                title={`${variant.color} ${variant.quantity === 0 ? '(Out of Stock)' : `(${variant.quantity} left)`}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-leather-700">${product.new_price}</span>
          {product.old_price && (
            <span className="text-sm text-stone-400 line-through">${product.old_price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
