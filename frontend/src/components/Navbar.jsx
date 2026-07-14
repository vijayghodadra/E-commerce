import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Trash,
  Plus,
  Minus,
  ArrowRight,
  LogOut,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { cartSuccess, cartFailure, clearCart } from '../store/slices/cartSlice';
import { selectCartTotals } from '../store/slices/cartSlice';
import { clearWishlist } from '../store/slices/wishlistSlice';
import API from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist.products);
  const totals = useSelector(selectCartTotals);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'All Products', path: '/shop' },
    { label: 'Skin Care', path: '/shop?category=skin-care' },
    { label: 'Hair Care', path: '/shop?category=hair-care' },
    { label: 'Bath & Body', path: '/shop?category=bath-body' },
    { label: 'Our Story', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return (location.pathname + location.search).startsWith(path);
  };

  // Sync cart from server when user logs in
  useEffect(() => {
    if (token) {
      const fetchCart = async () => {
        try {
          const res = await API.get('/cart-wishlist/cart');
          if (res.data.success) {
            dispatch(cartSuccess({ items: res.data.cart.items }));
          }
        } catch (err) {
          dispatch(cartFailure(err.response?.data?.message || err.message));
        }
      };
      fetchCart();
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearWishlist());
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const updateCartQty = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    try {
      const res = await API.put('/cart-wishlist/cart/update', { productId, qty: newQty });
      if (res.data.success) {
        dispatch(cartSuccess({ items: res.data.cart.items }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await API.delete(`/cart-wishlist/cart/remove/${productId}`);
      if (res.data.success) {
        dispatch(cartSuccess({ items: res.data.cart.items }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-accent text-primary text-xs font-semibold py-2 px-4 text-center tracking-wider uppercase border-b border-accent-dark">
        🌿 Pure Botanical Luxury • Free Shipping on orders above Rs. 999 • 🌿
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-40 bg-cream-light/90 backdrop-blur-md border-b border-[#FAF7F2]/40 transition-all duration-300 ${
        isScrolled ? 'shadow-premium py-0' : 'py-1'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}>
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-primary p-2 md:hidden hover:text-primary-light focus:outline-none"
              >
                <Menu size={24} />
              </button>
              <Link to="/" className="flex items-center space-x-2.5 ml-2 md:ml-0 group">
                <svg
                  className="w-7 h-7 text-primary group-hover:text-secondary-dark transition-colors duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" className="opacity-[0.08]" fill="currentColor" />
                  <path d="M12 22V12" />
                  <path d="M12 12c2.5-2.5 5-2.5 5-5s-2.5-1-5 2.5c0 0 0 0 0 0z" fill="currentColor" className="opacity-90" />
                  <path d="M12 12c-2.5-2.5-5-2.5-5-5s2.5-1 5 2.5c0 0 0 0 0 0z" fill="currentColor" className="opacity-90" />
                  <path d="M12 16c2-2 4-2 4-4s-2-.8-4 2c0 0 0 0 0 0z" fill="currentColor" className="opacity-70" />
                  <path d="M12 16c-2-2-4-2-4-4s2-.8 4 2c0 0 0 0 0 0z" fill="currentColor" className="opacity-70" />
                </svg>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.18em] text-primary group-hover:text-[#14301B] transition-colors duration-300">
                  VEDA
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-7 text-[11px] font-semibold tracking-[0.2em] uppercase text-primary">
              {navItems.map((item) => {
                const active = isLinkActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative py-2.5 transition-colors duration-300 ${
                      active ? 'text-secondary-dark' : 'hover:text-secondary-dark'
                    } group`}
                  >
                    {item.label}
                    {/* Sliding underline */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-secondary-dark transition-all duration-300 ${
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Icons Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-primary hover:text-secondary-dark hover:scale-110 transition-all duration-300 p-2 flex items-center justify-center focus:outline-none"
                title="Search"
              >
                <Search size={20} />
              </button>

              {/* Profile Menu */}
              <div className="relative flex items-center justify-center">
                {token ? (
                  <>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center justify-center focus:outline-none group p-1"
                      title="Account Menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#0F5132] text-white flex items-center justify-center font-bold text-[10px] uppercase tracking-wider shadow-inner group-hover:bg-[#0c4027] transition-all duration-300">
                        {(() => {
                          if (!user?.name) return 'U';
                          const parts = user.name.trim().split(/\s+/);
                          return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
                        })()}
                      </div>
                      <ChevronDown size={11} className="text-primary group-hover:text-secondary-dark transition-colors hidden sm:inline ml-1" />
                    </button>
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-36 w-56 bg-white border border-[#E3ECE6] rounded-md shadow-premium z-50 text-xs overflow-hidden">
                        <div className="px-4 py-3 bg-[#F4FAF7] border-b border-[#E3ECE6]">
                          <p className="font-bold text-[#1C3F24] line-clamp-1">{user?.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2.5 text-[#1C3F24] hover:bg-cream-dark transition-colors font-medium"
                            >
                              <span className="text-xs">🛡️</span>
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <Link
                            to="/my-orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-[#1C3F24] hover:bg-cream-dark transition-colors font-medium"
                          >
                            <ShoppingBag size={14} className="text-gray-400" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-[#1C3F24] hover:bg-cream-dark transition-colors font-medium"
                          >
                            <Heart size={14} className="text-gray-400" />
                            <span>My Wishlist</span>
                          </Link>
                        </div>
                        <div className="border-t border-[#E3ECE6] py-1 bg-gray-50">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center space-x-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors font-bold"
                          >
                            <LogOut size={14} className="text-red-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="text-primary hover:text-secondary-dark hover:scale-110 transition-all duration-300 p-2 flex items-center justify-center"
                    title="Account"
                  >
                    <UserIcon size={20} />
                  </Link>
                )}
              </div>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="text-primary hover:text-secondary-dark hover:scale-110 transition-all duration-300 p-2 relative flex items-center justify-center"
                title="Wishlist"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#C62828] text-white rounded-full text-[8px] w-3.5 h-3.5 flex items-center justify-center font-bold shadow-sm border border-white animate-pulse">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Toggle */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="text-primary hover:text-secondary-dark hover:scale-110 transition-all duration-300 p-2 relative flex items-center justify-center focus:outline-none"
                title="Shopping Bag"
              >
                <ShoppingBag size={20} />
                {items.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-cream rounded-full text-[8px] w-3.5 h-3.5 flex items-center justify-center font-bold shadow-sm border border-white animate-pulse">
                    {items.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Search Bar */}
        {searchOpen && (
          <div className="bg-cream border-t border-b border-cream-dark py-4 px-4 transition-all duration-300">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium Ayurvedic serums, hair oils, soaps..."
                className="w-full bg-white border border-cream-dark px-4 py-3 pr-12 focus:outline-none focus:border-primary text-sm font-sans"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 p-2 text-primary hover:text-secondary"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-out Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-4/5 max-w-xs bg-cream-light h-full shadow-premium py-6 px-6 overflow-y-auto z-50">
            <div className="flex justify-between items-center mb-8">
              <span className="font-serif text-xl font-bold text-primary">☘️ VEDA</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-primary p-2">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col space-y-4 text-base font-medium uppercase tracking-wider text-primary">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">All Products</Link>
              <Link to="/shop?category=skin-care" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">Skin Care</Link>
              <Link to="/shop?category=hair-care" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">Hair Care</Link>
              <Link to="/shop?category=bath-body" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">Bath & Body</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">Our Story</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-cream-dark">Contact</Link>
            </nav>
          </div>
        </div>
      )}

      {/* Slide-out Shopping Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setCartDrawerOpen(false)}></div>

          {/* Drawer Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-premium flex flex-col animate-slide-in">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-cream-dark flex items-center justify-between bg-cream-light">
                <h2 className="text-base font-serif font-bold text-primary tracking-wide">
                  Cart ({items.length} Product{items.length !== 1 ? 's' : ''})
                </h2>
                <button onClick={() => setCartDrawerOpen(false)} className="text-primary p-1.5 hover:bg-cream-dark rounded-full transition-colors">
                  <X size={22} className="stroke-[1.5]" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator (Just Herbs style) */}
              {items.length > 0 && (
                <div className="bg-[#F3FAF7] border-b border-cream-dark px-6 py-4 flex flex-col space-y-2 shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#0F5132] font-semibold">
                      {totals.subtotal >= 999 ? (
                        <span>🎉 Congratulations! You unlocked <strong>Free Delivery</strong></span>
                      ) : (
                        <span>Add product worth <strong>Rs. {999 - totals.subtotal}</strong> to unlock Free Delivery</span>
                      )}
                    </span>
                    {totals.subtotal < 999 && (
                      <button
                        onClick={() => {
                          setCartDrawerOpen(false);
                          navigate('/shop');
                        }}
                        className="bg-[#0F5132] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-[#0c4027] transition-colors"
                      >
                        Add Items
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-[#E6F4F0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F5132] h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (totals.subtotal / 999) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Drawer Body - Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                    <div className="bg-cream p-6 rounded-full text-primary">
                      <ShoppingBag size={48} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary">Your bag is empty</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Looks like you haven't added anything to your cart yet.</p>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        navigate('/shop');
                      }}
                      className="btn-primary"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Cart Items list */}
                    {items.map((item) => {
                      if (!item.product) return null;
                      const activePrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                      const isDiscounted = item.product.discountPrice > 0;
                      const discountPercentage = isDiscounted 
                        ? Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)
                        : 0;

                      return (
                        <div key={item.product._id} className="flex items-start space-x-3.5 border-b border-cream-dark pb-5">
                          <img
                            src={(Array.isArray(item.product.images) && typeof item.product.images[0] === 'string') ? item.product.images[0] : 'https://placehold.co/400x400?text=No+Image'}
                            alt={item.product.name}
                            className="w-16 h-20 object-cover border border-cream-dark bg-cream-light rounded-sm shrink-0"
                          />
                          <div className="flex-1 flex flex-col">
                            <div>
                              <h4 className="text-xs font-bold text-gray-800 line-clamp-2">
                                {item.product.name}
                              </h4>
                              <p className="text-[10px] text-gray-400 mt-1">
                                Size: {item.product.category?.name === 'Skin Care' || item.product.category === 'skin-care' ? '100ml' : '200ml'} | 100% Ayurvedic
                              </p>
                              
                              <div className="text-xs font-bold text-gray-800 mt-2 flex items-center space-x-1.5">
                                <span>Rs. {activePrice}</span>
                                {isDiscounted && (
                                  <>
                                    <span className="text-[10px] text-gray-400 line-through font-normal">Rs. {item.product.price}</span>
                                    <span className="bg-[#C62828] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                      {discountPercentage}% Off
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {isDiscounted && (
                              <p className="text-[10px] text-[#0F5132] font-semibold mt-1">
                                You save Rs. {(item.product.price - item.product.discountPrice) * item.qty}
                              </p>
                            )}
                          </div>

                          {/* Qty adjustments pill */}
                          <div className="flex flex-col items-end space-y-2 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-md bg-white px-2 py-0.5 space-x-2.5">
                              <button
                                onClick={() => updateCartQty(item.product._id, item.qty, -1)}
                                className="text-gray-400 hover:text-black p-0.5"
                              >
                                <Minus size={11} className="stroke-[2]" />
                              </button>
                              <span className="text-xs font-bold text-gray-800">{item.qty}</span>
                              <button
                                onClick={() => updateCartQty(item.product._id, item.qty, 1)}
                                className="text-gray-400 hover:text-black p-0.5"
                              >
                                <Plus size={11} className="stroke-[2]" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.product._id)}
                              className="text-gray-400 hover:text-red-500 text-[10px] underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Savings summary banner */}
                    {items.reduce((sum, item) => sum + (item.product?.discountPrice > 0 ? (item.product.price - item.product.discountPrice) * item.qty : 0), 0) + totals.discount > 0 && (
                      <div className="bg-[#F3FAF7] border border-dashed border-[#A3D9C9] p-3 rounded-md flex flex-col space-y-1">
                        <div className="text-xs text-[#0F5132] font-bold flex items-center">
                          🌿 You save Rs. {items.reduce((sum, item) => sum + (item.product?.discountPrice > 0 ? (item.product.price - item.product.discountPrice) * item.qty : 0), 0) + totals.discount} on this order!
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          Save more at checkout with coupons & offers
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer - Totals summary */}
              {items.length > 0 && (
                <div className="border-t border-cream-dark bg-cream-light py-4 px-6 flex items-center justify-between shadow-premium shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">To Pay <span className="text-[9px] lowercase italic">(incl. taxes)</span></span>
                    <span className="text-lg font-bold text-gray-800">Rs. {totals.total}</span>
                    <span className="text-[10px] text-[#0F5132] font-semibold mt-0.5">
                      {totals.shipping === 0 ? '*Free shipping unlocked' : `*Add Rs. ${999 - totals.subtotal} for free shipping`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      navigate('/checkout');
                    }}
                    className="bg-[#0F5132] hover:bg-[#0c4027] text-white py-2.5 px-6 rounded-[4px] flex flex-col items-center justify-center space-y-0.5 tracking-wide shadow-md transition-all shrink-0"
                  >
                    <span className="font-bold text-xs uppercase tracking-wider">Place Order</span>
                    <span className="text-[9px] text-[#A3D9C9] font-medium">UPI / Card / Cash on Delivery</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
