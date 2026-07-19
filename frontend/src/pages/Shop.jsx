import React, { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Filter, Grid3X3, LayoutList, SlidersHorizontal } from 'lucide-react';
import { productAPI } from '../services/api.js';
import ProductCard from '../components/product/ProductCard.jsx';

const categories = [
  { value: '', label: 'All Products' },
  { value: 'men_purse', label: "Men's Purses" },
  { value: 'ladies_purse', label: "Ladies' Purses" },
  { value: 'gents_belt', label: "Gents' Belts" },
];

export default function Shop() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = category || searchParams.get('category') || '';

  const { data, isLoading } = useQuery(
    ['products', activeCategory, searchQuery, currentPage],
    () => productAPI.getAll({
      category: activeCategory,
      search: searchQuery,
      page: currentPage,
      limit: 12,
    }),
    { select: (res) => res.data }
  );

  const products = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="section-title">
            {searchQuery ? `Search: "${searchQuery}"` : categories.find(c => c.value === activeCategory)?.label || 'All Products'}
          </h1>
          <p className="text-stone-500">
            {pagination?.total || 0} products found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 sticky top-24">
              <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-stone-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        if (cat.value) {
                          setSearchParams({ category: cat.value });
                        } else {
                          setSearchParams({});
                        }
                        setCurrentPage(1);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeCategory === cat.value
                          ? 'bg-leather-50 text-leather-700 font-medium'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-leather-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-leather-700 text-white' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-leather-700 text-white' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-stone-200 rounded-lg mb-4" />
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Filter size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-xl font-medium text-stone-600 mb-2">No products found</h3>
                <p className="text-stone-400">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-stone-300 rounded-md text-sm disabled:opacity-50 hover:bg-stone-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-stone-600">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-stone-300 rounded-md text-sm disabled:opacity-50 hover:bg-stone-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
