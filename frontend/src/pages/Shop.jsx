import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, Heart, Star, X } from 'lucide-react';
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

  // Filter States
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const searchWord = searchParams.get('search') || '';

  // Data States
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state from query parameters
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedRating(searchParams.get('rating') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products whenever filters change
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
        params.limit = 6; // 6 products per page

        const res = await API.get('/products', { params });
        if (res.data.success) {
          const cleaned = (res.data.products || []).map(p => {
            if (p.images) {
              p.images = p.images.map(img => img.includes('unsplash.com') ? img.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=90') : img);
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

  // Push new search params on filter update
  const updateQueryParams = (newParams) => {
    const current = {};
    searchParams.forEach((value, key) => {
      current[key] = value;
    });

    const merged = { ...current, ...newParams };
    
    // Clear empty params
    Object.keys(merged).forEach((key) => {
      if (merged[key] === '' || merged[key] === null || merged[key] === undefined) {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleCategorySelect = (slug) => {
    updateQueryParams({ category: slug, page: 1 });
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    updateQueryParams({ minPrice, maxPrice, page: 1 });
  };

  const handleRatingSelect = (rating) => {
    updateQueryParams({ rating: rating === selectedRating ? '' : rating, page: 1 });
  };

  const handleSortChange = (e) => {
    updateQueryParams({ sortBy: e.target.value, page: 1 });
  };

  const handlePageChange = (p) => {
    updateQueryParams({ page: p });
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      showToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }
    try {
      const res = await API.post('/cart-wishlist/cart/add', { productId, qty: 1 });
      if (res.data.success) {
        dispatch(cartSuccess({ items: res.data.cart.items }));
        showToast('Added to bag successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to bag', 'error');
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!token) {
      showToast('Please login to update wishlist', 'error');
      navigate('/login');
      return;
    }
    try {
      const res = await API.post('/cart-wishlist/wishlist/toggle', { productId });
      if (res.data.success) {
        dispatch(wishlistSuccess({ products: res.data.wishlist.products }));
        showToast(res.data.isAdded ? 'Added to wishlist!' : 'Removed from wishlist');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  const isProductInWishlist = (productId) => {
    return Array.isArray(wishlist) && wishlist.some((p) => p && (p._id === productId || p === productId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner / Title */}
      <div className="border-b border-cream-dark pb-6 mb-8">
        <h1 className="text-3xl font-serif font-bold text-primary">
          {selectedCategory ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Rituals'}` : 'Botanical Collection'}
        </h1>
        {searchWord && (
          <p className="text-sm text-gray-500 mt-2 font-sans">
            Showing search results for "<strong>{searchWord}</strong>" ({totalCount} items)
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white border border-cream-dark px-4 py-2 text-primary font-bold text-xs uppercase tracking-wider"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <div className={`fixed inset-0 z-50 lg:static lg:block lg:z-auto ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-cream-dark p-6 space-y-8 overflow-y-auto lg:static lg:w-64 lg:border lg:h-fit z-50 transform transition-transform duration-300 lg:transform-none">
            <div className="flex justify-between items-center pb-4 border-b border-cream-dark">
              <h3 className="font-serif text-base font-bold text-primary flex items-center">
                <SlidersHorizontal size={16} className="mr-2" /> Filters
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => { handleResetFilters(); setSidebarOpen(false); }}
                  className="text-[11px] text-gray-400 hover:text-primary flex items-center space-x-1 uppercase tracking-wider font-semibold"
                >
                  <RotateCcw size={10} />
                  <span>Reset</span>
                </button>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-primary">
                  <X size={18} />
                </button>
              </div>
            </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-sm font-bold text-primary mb-4">Categories</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left text-xs uppercase tracking-wide font-medium py-1.5 px-2.5 rounded-sm transition-colors ${
                  !selectedCategory ? 'bg-accent text-primary font-semibold' : 'text-gray-600 hover:bg-cream-dark'
                }`}
              >
                All Rituals
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left text-xs uppercase tracking-wide font-medium py-1.5 px-2.5 rounded-sm transition-colors ${
                    selectedCategory === cat.slug ? 'bg-accent text-primary font-semibold' : 'text-gray-600 hover:bg-cream-dark'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-serif text-sm font-bold text-primary mb-4">Price Range</h4>
            <form onSubmit={handlePriceFilter} className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-cream-light border border-cream-dark text-xs p-2 focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-cream-light border border-cream-dark text-xs p-2 focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-light text-cream text-[10px] uppercase font-bold tracking-wider py-2 transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Ratings */}
          <div>
            <h4 className="font-serif text-sm font-bold text-primary mb-4">Customer Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSelect(String(star))}
                  className={`flex items-center space-x-2 text-xs w-full p-1.5 rounded-sm transition-colors ${
                    selectedRating === String(star) ? 'bg-accent text-primary font-semibold' : 'text-gray-600 hover:bg-cream-light'
                  }`}
                >
                  <div className="flex text-secondary">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={12}
                        className={idx < star ? 'fill-secondary text-secondary' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 font-sans font-medium">& Up</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

        {/* Right Product Grid Column */}
        <main className="flex-1">
          {/* Controls header */}
          <div className="flex justify-between items-center pb-4 border-b border-cream-dark mb-6">
            <span className="text-xs text-gray-500 font-sans">
              Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> products
            </span>
            <div className="flex items-center space-x-2">
              <ArrowUpDown size={14} className="text-primary" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-cream border border-cream-dark text-xs p-2 focus:outline-none focus:border-primary font-medium text-primary rounded-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-cream h-[400px] animate-pulse rounded-sm"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-cream-light/35 border border-cream-dark rounded-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary">No products found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or search keywords.</p>
              <button onClick={handleResetFilters} className="btn-outline text-xs">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isProductInWishlist(prod._id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-sm transition-colors ${
                          pNum === page
                            ? 'bg-primary text-cream'
                            : 'bg-white border border-cream-dark text-primary hover:bg-cream-dark'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
