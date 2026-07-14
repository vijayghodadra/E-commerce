import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, Star, X, ChevronDown } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { cartSuccess } from '../store/slices/cartSlice';
import { wishlistSuccess } from '../store/slices/wishlistSlice';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.products);

  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const searchWord = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedRating(searchParams.get('rating') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProductsList = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (selectedRating) params.rating = selectedRating;
        if (sortBy) params.sortBy = sortBy;
        if (page) params.page = page;
        if (searchWord) params.search = searchWord;
        params.limit = 6;

        const res = await API.get('/products', { params });
        if (res.data.success) {
          const cleaned = (res.data.products || []).map(p => {
            if (Array.isArray(p.images)) {
              p.images = p.images.map(img =>
                (typeof img === 'string' && img.includes('unsplash.com'))
                  ? img.replace(/w=\d+/, 'w=800').replace(/q=\d+/, 'q=85')
                  : (img || '')
              );
            } else {
              p.images = [];
            }
            return p;
          });
          setProducts(cleaned);
          setTotalPages(res.data.pages);
          setTotalCount(res.data.count);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsList();
  }, [selectedCategory, minPrice, maxPrice, selectedRating, sortBy, page, searchWord]);

  const updateQueryParams = (newParams) => {
    const current = {};
    searchParams.forEach((value, key) => { current[key] = value; });
    const merged = { ...current, ...newParams };
    Object.keys(merged).forEach((key) => {
      if (merged[key] === '' || merged[key] === null || merged[key] === undefined) {
        delete merged[key];
      }
    });
    setSearchParams(merged);
  };

  const handleCategorySelect = (slug) => {
    updateQueryParams({ category: slug, page: 1 });
    setSidebarOpen(false);
  };
  const handlePriceFilter = (e) => {
    e.preventDefault();
    updateQueryParams({ minPrice, maxPrice, page: 1 });
    setSidebarOpen(false);
  };
  const handleRatingSelect = (rating) => {
    updateQueryParams({ rating: rating === selectedRating ? '' : rating, page: 1 });
  };
  const handleSortChange = (e) => {
    updateQueryParams({ sortBy: e.target.value, page: 1 });
  };
  const handlePageChange = (p) => {
    updateQueryParams({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleResetFilters = () => {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
    setSidebarOpen(false);
  };

  const handleAddToCart = async (productId) => {
    if (!token) { showToast('Please login to add items to cart', 'error'); navigate('/login'); return; }
    try {
      const res = await API.post('/cart-wishlist/cart/add', { productId, qty: 1 });
      if (res.data.success) { dispatch(cartSuccess({ items: res.data.cart.items })); showToast('Added to bag!'); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to add to bag', 'error'); }
  };

  const handleToggleWishlist = async (productId) => {
    if (!token) { showToast('Please login to update wishlist', 'error'); navigate('/login'); return; }
    try {
      const res = await API.post('/cart-wishlist/wishlist/toggle', { productId });
      if (res.data.success) {
        dispatch(wishlistSuccess({ products: res.data.wishlist.products }));
        showToast(res.data.isAdded ? 'Added to wishlist!' : 'Removed from wishlist');
      }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update wishlist', 'error'); }
  };

  const isProductInWishlist = (productId) =>
    Array.isArray(wishlist) && wishlist.some((p) => p && (p._id === productId || p === productId));

  const activeFiltersCount = [selectedCategory, minPrice || maxPrice, selectedRating].filter(Boolean).length;

  // Filter sidebar content (reused for desktop + mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="font-serif text-base font-bold text-[#2E1E1C] flex items-center gap-2">
          <SlidersHorizontal size={16} /> Filters
          {activeFiltersCount > 0 && (
            <span className="bg-[#0F5132] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-gray-400 hover:text-[#0F5132] flex items-center gap-1 uppercase tracking-wider font-semibold transition-colors"
          >
            <RotateCcw size={10} /> Reset
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 p-1">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-[#2E1E1C] uppercase tracking-wider mb-3">Categories</h4>
        <div className="space-y-1">
          <button
            onClick={() => handleCategorySelect('')}
            className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
              !selectedCategory ? 'bg-[#0F5132] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                selectedCategory === cat.slug ? 'bg-[#0F5132] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-[#2E1E1C] uppercase tracking-wider mb-3">Price Range</h4>
        <form onSubmit={handlePriceFilter} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132]/20"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132]/20"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0F5132] hover:bg-[#0c4027] text-white text-xs uppercase font-bold tracking-wider py-2.5 rounded-lg transition-colors"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Ratings */}
      <div>
        <h4 className="text-xs font-bold text-[#2E1E1C] uppercase tracking-wider mb-3">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingSelect(String(star))}
              className={`flex items-center gap-2 text-sm w-full p-2 rounded-lg transition-colors ${
                selectedRating === String(star) ? 'bg-[#E7F6EE] text-[#0F5132] font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    size={13}
                    className={idx < star ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-xs">& Up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E1E1C]">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Collection'
            : 'Botanical Collection'}
        </h1>
        {searchWord && (
          <p className="text-sm text-gray-500 mt-1">
            Showing results for "<strong>{searchWord}</strong>" — {totalCount} items
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between gap-3 mb-5 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 shadow-sm active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-[#0F5132] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Mobile sort */}
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full appearance-none bg-white border border-gray-200 text-sm py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:border-[#0F5132] font-medium text-gray-700 shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24 shadow-sm">
              <FilterContent />
            </div>
          </aside>

          {/* ── Mobile Bottom Sheet Drawer ── */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={() => setSidebarOpen(false)}
              />
              {/* Drawer slides up from bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 px-5 pb-8 pt-2">
                  <FilterContent />
                </div>
              </div>
            </div>
          )}

          {/* ── Products Area ── */}
          <main className="flex-1 min-w-0">
            {/* Desktop Controls Bar */}
            <div className="hidden lg:flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <span className="text-sm text-gray-500">
                Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> products
              </span>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="bg-white border border-gray-200 text-sm p-2 focus:outline-none focus:border-[#0F5132] font-medium text-gray-700 rounded-lg"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Mobile count */}
            <p className="lg:hidden text-xs text-gray-400 mb-4">
              {totalCount} products found
            </p>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl h-[320px] sm:h-[380px] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl space-y-4 mx-auto max-w-sm">
                <div className="text-5xl">🌿</div>
                <h3 className="font-serif text-lg font-bold text-[#2E1E1C]">No products found</h3>
                <p className="text-sm text-gray-500 px-6">Try adjusting your filters or search keywords.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#0F5132] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#0c4027] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                  {products.map((prod, idx) => (
                    <div
                      key={prod._id}
                      className="card-reveal"
                      style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                    >
                      <ProductCard
                        product={prod}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={isProductInWishlist(prod._id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => handlePageChange(pNum)}
                          className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-xl transition-colors ${
                            pNum === page
                              ? 'bg-[#0F5132] text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
