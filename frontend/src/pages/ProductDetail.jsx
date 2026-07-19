import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Heart, ShoppingBag, Ruler, Star, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { productAPI, reviewAPI } from '../services/api.js';
import { useCartStore, useAuthStore, useWishlistStore } from '../context/store.js';
import ProductGallery from '../components/product/ProductGallery.jsx';
import FlashSaleTimer from '../components/product/FlashSaleTimer.jsx';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isInWishlist, toggleItem } = useWishlistStore();

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => productAPI.getById(id),
    { select: (res) => res.data }
  );

  const { data: reviews } = useQuery(
    ['reviews', id],
    () => reviewAPI.getByProduct(id),
    { select: (res) => res.data, enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather-700" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Product Not Found</h2>
          <p className="text-stone-500">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const activeVariant = selectedVariant || product.variants?.[0];
  const inWishlist = isInWishlist(product.id);
  const discount = product.old_price
    ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!activeVariant || activeVariant.quantity === 0) {
      toast.error('Please select an available color variant');
      return;
    }
    if (quantity > activeVariant.quantity) {
      toast.error(`Only ${activeVariant.quantity} items available in this color`);
      return;
    }
    addItem(product, activeVariant, quantity);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }
    toggleItem(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-stone-500 mb-6">
          <span className="hover:text-leather-700 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-leather-700 cursor-pointer capitalize">{product.category?.replace('_', ' ')}</span>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images || []} title={product.title} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">{product.title}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.round(averageRating) ? 'text-gold-400 fill-gold-400' : 'text-stone-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-stone-500">({reviews?.length || 0} reviews)</span>
              </div>
            </div>

            {/* Flash Sale Timer */}
            {product.is_flash_sale && product.flash_sale_end && (
              <FlashSaleTimer endDate={product.flash_sale_end} />
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-leather-700">${product.new_price}</span>
              {product.old_price && (
                <>
                  <span className="text-xl text-stone-400 line-through">${product.old_price}</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-stone-600 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-stone-900">
                  Color: <span className="text-stone-600">{activeVariant?.color}</span>
                </h3>
                <span className={`text-sm font-medium ${activeVariant?.quantity < 3 ? 'text-red-600' : 'text-green-600'}`}>
                  {activeVariant?.quantity === 0 ? 'Out of Stock' : `${activeVariant?.quantity} in stock`}
                </span>
              </div>
              <div className="flex gap-3">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    disabled={variant.quantity === 0}
                    className={`relative w-12 h-12 rounded-full border-3 transition-all ${
                      activeVariant?.id === variant.id
                        ? 'border-leather-700 ring-2 ring-leather-200'
                        : 'border-stone-200 hover:border-stone-400'
                    } ${variant.quantity === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: variant.colorHex || '#ccc' }}
                    title={`${variant.color} (${variant.quantity} available)`}
                  >
                    {activeVariant?.id === variant.id && (
                      <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow-md" />
                    )}
                    {variant.quantity === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-stone-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-stone-300 rounded-md flex items-center justify-center hover:bg-stone-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(activeVariant?.quantity || 1, quantity + 1))}
                  disabled={quantity >= (activeVariant?.quantity || 1)}
                  className="w-10 h-10 border border-stone-300 rounded-md flex items-center justify-center hover:bg-stone-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Size Guide Button */}
            <button
              onClick={() => setShowSizeGuide(true)}
              className="flex items-center gap-2 text-leather-700 hover:text-leather-800 font-medium"
            >
              <Ruler size={18} />
              Size & Dimensions Guide
            </button>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={activeVariant?.quantity === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={activeVariant?.quantity === 0}
                className="flex-1 btn-outline disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`p-4 border rounded-md transition-colors ${
                  inWishlist ? 'bg-red-50 border-red-300 text-red-500' : 'border-stone-300 text-stone-600 hover:border-leather-700'
                }`}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
              <div className="text-center">
                <Truck size={24} className="mx-auto text-leather-700 mb-2" />
                <p className="text-xs text-stone-600">Free Shipping<br/>Over $100</p>
              </div>
              <div className="text-center">
                <Shield size={24} className="mx-auto text-leather-700 mb-2" />
                <p className="text-xs text-stone-600">Secure<br/>Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw size={24} className="mx-auto text-leather-700 mb-2" />
                <p className="text-xs text-stone-600">Easy<br/>Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Customer Reviews</h2>
          {reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-6 border border-stone-200">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? 'text-gold-400 fill-gold-400' : 'text-stone-300'}
                      />
                    ))}
                  </div>
                  <p className="text-stone-600 text-sm mb-4">{review.comment}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-leather-100 rounded-full flex items-center justify-center text-leather-700 font-medium text-sm">
                      {review.first_name?.[0]}{review.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.first_name} {review.last_name}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
              <Star size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold">Size & Dimensions Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            {product.category === 'gents_belt' ? (
              <div>
                <h4 className="font-medium text-stone-900 mb-3">Belt Size Chart</h4>
                <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Belt Size</th>
                      <th className="px-4 py-3 text-left font-medium">Waist (inches)</th>
                      <th className="px-4 py-3 text-left font-medium">Total Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {[{size: '32', waist: '30-32', length: '38"'},
                      {size: '34', waist: '32-34', length: '40"'},
                      {size: '36', waist: '34-36', length: '42"'},
                      {size: '38', waist: '36-38', length: '44"'},
                      {size: '40', waist: '38-40', length: '46"'}].map(row => (
                      <tr key={row.size}>
                        <td className="px-4 py-3 font-medium">{row.size}"</td>
                        <td className="px-4 py-3">{row.waist}"</td>
                        <td className="px-4 py-3">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-sm text-stone-500 mt-4">
                  Tip: Measure your waist where you normally wear your belt. Add 2 inches for the perfect fit.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-stone-900 mb-3">Product Dimensions</h4>
                <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                  {product.dimensions && Object.entries(product.dimensions).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-stone-600 capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium">{Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-stone-500 mt-4">
                  All measurements are approximate and may vary slightly due to handmade nature.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
