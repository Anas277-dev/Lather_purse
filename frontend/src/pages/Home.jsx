import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { settingsAPI, productAPI } from '../services/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import FlashSaleTimer from '../components/product/FlashSaleTimer.jsx';

export default function Home() {
  const [currentBanner, setCurrentBanner] = React.useState(0);

  const { data: bannersData } = useQuery('banners', settingsAPI.getBanners, {
    select: (res) => res.data,
  });

  const { data: flashSales } = useQuery('flashSales', productAPI.getFlashSales, {
    select: (res) => res.data,
  });

  const { data: featuredProducts } = useQuery('featuredProducts', () => productAPI.getAll({ limit: 8 }), {
    select: (res) => res.data.products,
  });

  const banners = bannersData || [];

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  React.useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextBanner, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  return (
    <div>
      {/* Hero Carousel */}
      {banners.length > 0 && (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                <div className="max-w-2xl px-4">
                  <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4">{banner.title}</h2>
                  {banner.link_url && (
                    <Link
                      to={banner.link_url}
                      className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-md font-medium hover:bg-stone-100 transition-colors"
                    >
                      Shop Now <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === currentBanner ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Flash Sale Section */}
      {flashSales && flashSales.length > 0 && (
        <section className="py-12 bg-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="section-title text-red-800">Flash Sale</h2>
                <p className="section-subtitle">Limited time offers on premium leather goods</p>
              </div>
              {flashSales[0]?.flash_sale_end && (
                <FlashSaleTimer endDate={flashSales[0].flash_sale_end} />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSales.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore our premium collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: "Men's Purses", 
                image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
                link: '/shop/men_purse',
                desc: 'Sophisticated wallets & card holders'
              },
              { 
                title: "Ladies' Purses", 
                image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
                link: '/shop/ladies_purse',
                desc: 'Elegant clutches & crossbody bags'
              },
              { 
                title: "Gents' Belts", 
                image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600',
                link: '/shop/gents_belt',
                desc: 'Handcrafted leather belts'
              },
            ].map((cat) => (
              <Link key={cat.link} to={cat.link} className="group relative overflow-hidden rounded-xl aspect-[4/5]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-serif font-bold mb-1">{cat.title}</h3>
                  <p className="text-sm text-white/80">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked premium leather goods</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
                View All Products <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { title: 'Premium Leather', desc: '100% genuine full-grain leather' },
              { title: 'Free Shipping', desc: 'On orders over $100' },
              { title: 'Secure Payment', desc: 'COD & Card payments accepted' },
              { title: 'Easy Returns', desc: '30-day return policy' },
            ].map((feature) => (
              <div key={feature.title} className="p-6">
                <h4 className="font-serif font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-stone-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
