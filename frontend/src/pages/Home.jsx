import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Leaf, Sparkles, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../hooks/useToast';
import { cartSuccess } from '../store/slices/cartSlice';
import { wishlistSuccess } from '../store/slices/wishlistSlice';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

const heroSlides = [
  {
    subtitle: 'OUR BIRTHDAY',
    title: 'Your Beauty Treat',
    discount: 'UPTO 75% OFF',
    promoCode: 'GET10',
    description: 'Extra 10% Off on ₹999+ | Extra 5% off on UPI. Get additional freebies on purchase of ₹599+',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
    link: '/shop',
    bgColor: '#F5E6D8',
  },
  {
    subtitle: 'BOTANICAL GLOW',
    title: 'Saffron Skin Elixir',
    discount: 'FLAT 15% OFF',
    promoCode: 'GLOW15',
    description: 'Slow-brewed with 21 rare herbs for a radiant, golden complexion. Free face wash on orders over ₹800.',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200&auto=format&fit=crop',
    link: '/shop?category=skin-care',
    bgColor: '#F6ECE2',
  },
  {
    subtitle: 'ORGANIC HAIRCARE',
    title: 'Bhringraj Vitality',
    discount: 'BUY 1 GET 1',
    promoCode: 'HAIRBOGO',
    description: 'Nourishing oil blends packed with raw Amla and sesame seeds. Restores root vitality & shine.',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop',
    link: '/shop?category=hair-care',
    bgColor: '#EAF0EB',
  },
  {
    subtitle: 'NEEM & TEA TREE',
    title: 'Acne Clarifying Kit',
    discount: 'FLAT 20% OFF',
    promoCode: 'NEEM20',
    description: 'Formulated with organic neem leaves and steam-distilled tea tree oil to clean pores and prevent breakouts.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop',
    link: '/shop?category=skin-care',
    bgColor: '#E6EFEA',
  },
  {
    subtitle: 'KANNAUJ ROSES',
    title: 'Vedic Rose Water',
    discount: 'BUY 2 GET 1',
    promoCode: 'ROSEFREE',
    description: 'Directly sourced from Kannauj rose fields, steam-distilled for maximum purity, toning, and hydration.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop',
    link: '/shop?category=skin-care',
    bgColor: '#FDF0EE',
  },
  {
    subtitle: 'ROYAL UBTAN',
    title: 'Vedic Radiance Pack',
    discount: 'UPTO 50% OFF',
    promoCode: 'UBTAN50',
    description: 'Slow-ground sandalwood powder, saffron threads, and turmeric root to naturally revive skin complexion.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop',
    link: '/shop?category=skin-care',
    bgColor: '#F9F4E5',
  },
];

const paddedSlides = [
  heroSlides[heroSlides.length - 1], // Duplicate of Slide 5 at the beginning
  ...heroSlides,
  heroSlides[0],                     // Duplicate of Slide 0 at the end
];

const testimonials = [
  {
    name: 'Anjali Deshmukh',
    role: 'Verified Customer',
    rating: 5,
    comment: 'The Kumkumadi Serum has completely transformed my skin texture. It feels so soft, clear, and glowing!',
  },
  {
    name: 'Siddharth Sen',
    role: 'Verified Customer',
    rating: 5,
    comment: 'Finally, a shampoo that does not cause hair fall. The Hibiscus cleanser smells amazing and leaves my hair thick.',
  },
  {
    name: 'Priyanka Iyer',
    role: 'Verified Customer',
    rating: 4.8,
    comment: 'Handcrafted soaps are luxurious. Almond Saffron soap is my favorite. Highly recommend this brand!',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.products);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto slide hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, isTransitioning]);

  // Accent color map per slug (for styling, image comes from DB)
  const accentMap = {
    'skin-care':          '#4A7C6F',
    'hair-care':          '#5C4A3A',
    'bath-body':          '#7B5E7B',
    'fragrance-wellness': '#8B5E3C',
  };
  const labelMap = {
    'skin-care':          'Glow & Radiance',
    'hair-care':          'Strength & Shine',
    'bath-body':          'Cleanse & Revive',
    'fragrance-wellness': 'Calm & Balance',
  };

  // Fetch best sellers, new arrivals & categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, catRes] = await Promise.all([
          API.get('/products/trending/list'),
          API.get('/categories'),
        ]);
        if (trendingRes.data.success) {
          const cleanList = (list) => list.map(p => {
            if (p.images) {
              p.images = p.images.map(img => img.includes('unsplash.com') ? img.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=90') : img);
            }
            return p;
          });
          setBestSellers(cleanList(trendingRes.data.bestSellers || []));
          setNewArrivals(cleanList(trendingRes.data.newArrivals || []));
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    return wishlist.some((p) => p._id === productId);
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };
  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === paddedSlides.length - 1) {
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      setCurrentIndex(paddedSlides.length - 2);
    }
  };
  const handleDotClick = (idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(idx + 1);
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden w-full py-4 sm:py-6 bg-[#fdfbf9]">
        <div 
          className={`flex ${isTransitioning ? 'transition-transform duration-200 ease-in-out' : ''} sm:px-[10%]`}
          style={{
            transform: isMobile
              ? `translateX(-${currentIndex * 100}vw)`
              : `translateX(calc(-${currentIndex * 80}vw + 10vw))`
          }}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {paddedSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`w-full sm:w-[80vw] flex-shrink-0 px-2 sm:px-4 transition-all duration-200 ${
                idx === currentIndex ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-50'
              }`}
            >
              <div 
                style={{ backgroundColor: slide.bgColor }}
                className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#F0E6DD] flex flex-col md:flex-row items-center justify-between h-[300px] sm:h-[380px] md:h-[480px] p-5 sm:p-10 md:p-12 relative"
              >
                {/* Left Content */}
                <div className="flex-1 space-y-2 sm:space-y-5 text-left z-10 max-w-lg">
                  <span className="text-[#8B5E3C] font-black tracking-widest text-[10px] sm:text-xs uppercase block">
                    {slide.subtitle}
                  </span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-[#4A2E2B] leading-tight">
                    {slide.title}
                  </h1>
                  
                  {/* Discount Badge */}
                  <div className="inline-flex flex-wrap items-center gap-2 sm:gap-4 my-1">
                    <span className="bg-[#4A2E2B] text-cream text-base sm:text-2xl font-black px-3 py-1 rounded-md leading-none shadow-sm uppercase">
                      {slide.discount}
                    </span>
                    {slide.promoCode && (
                      <span className="border-2 border-dashed border-[#8B5E3C] text-[#8B5E3C] text-[10px] sm:text-xs font-bold px-2.5 py-1 bg-white/40 rounded-sm">
                        USE CODE: <span className="font-extrabold text-[#4A2E2B]">{slide.promoCode}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C4033] font-medium leading-relaxed max-w-md hidden sm:block">
                    {slide.description}
                  </p>

                  <div className="pt-1 sm:pt-3">
                    <Link to={slide.link} className="bg-[#4A2E2B] hover:bg-[#2E1E1C] text-cream px-5 py-2.5 font-semibold text-xs rounded-full uppercase tracking-wider transition-colors inline-flex items-center gap-2">
                      <span>Explore Now</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Right Image */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 z-10"></div>
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-32 z-10"
                    style={{
                      background: `linear-gradient(to right, ${slide.bgColor}, transparent)`
                    }}
                  ></div>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chevron Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-primary border border-cream-dark p-2 sm:p-3 rounded-full shadow-md hover:scale-105 transition-all"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-primary border border-cream-dark p-2 sm:p-3 rounded-full shadow-md hover:scale-105 transition-all"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {heroSlides.map((_, idx) => {
            const activeDot = currentIndex === 0 
              ? heroSlides.length - 1 
              : currentIndex === paddedSlides.length - 1 
                ? 0 
                : currentIndex - 1;
            return (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  idx === activeDot ? 'bg-[#0F5132] w-8' : 'bg-[#E5DCD3] hover:bg-[#8B5E3C] w-4'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* Brand Benefit Infinite Marquee */}
      <div className="bg-[#F0F9F6] border-y border-[#E2F0EC] py-5 overflow-hidden select-none">
        <div className="flex whitespace-nowrap w-max animate-marquee">
          <div className="flex items-center space-x-16 px-10 text-[15px] font-bold text-[#0F5132] tracking-widest uppercase">
            <span>Modern Ayurveda</span>
            <span className="text-gray-400 font-light text-xl">—</span>
            <span>Proven by results</span>
            <span className="text-gray-400 font-light text-xl">—</span>
            <span>Nasties Free</span>
            <span className="text-gray-400 font-light text-xl">—</span>
            <span>Kind to you</span>
            <span className="text-gray-400 font-light text-xl">—</span>
          </div>
          <div className="flex items-center space-x-16 px-10 text-[15px] font-bold text-[#0F5132] tracking-widest uppercase">
            <span>Modern Ayurveda</span>
            <span className="text-gray-400 font-light text-xl">—</span>
            <span>Proven by results</span>
            <span className="text-gray-400 font-light text-xl">—</span>
            <span>Nasties Free</span>
            <span className="text-gray-400 font-light text-xl">—</span>
            <span>Kind to you</span>
            <span className="text-gray-400 font-light text-xl">—</span>
          </div>
        </div>
      </div>

      {/* Featured Categories Grid — Premium */}
      <section className="py-20 w-full bg-[#faf8f5]">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 px-4">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#8B5E3C] uppercase mb-3">Curated Collections</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2E1E1C] leading-tight mb-4">
            Shop by Rituals
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C8A882]"></div>
            <span className="text-[#C8A882] text-lg">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C8A882]"></div>
          </div>
          <p className="text-[#6B5144] text-sm leading-relaxed">
            Explore pure, organic rituals formulated with ancient Vedic wisdom — crafted to nourish your distinct hair and skin.
          </p>
        </div>

        {/* Cards Grid — images fetched live from DB */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => {
              const accent = accentMap[cat.slug] || '#8B5E3C';
              const label  = labelMap[cat.slug]  || cat.name;
              return (
              <Link
                key={cat._id || idx}
                to={`/shop?category=${cat.slug}`}
                className="group relative block overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500"
                style={{ height: 'clamp(220px, 40vw, 420px)' }}
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark gradient overlay — always visible at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent z-10"></div>

                {/* Colour accent tint on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"
                  style={{ backgroundColor: accent }}
                ></div>

                {/* Top badge */}
                <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span
                    className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: accent + 'CC' }}
                  >
                    {label}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                  {/* Category name */}
                  <h3 className="font-serif text-white text-xl font-bold leading-tight mb-1 drop-shadow-lg">
                    {cat.name}
                  </h3>

                  {/* Divider line that expands on hover */}
                  <div
                    className="h-[1.5px] w-8 group-hover:w-full transition-all duration-500 ease-out mb-3 rounded-full"
                    style={{ backgroundColor: accent }}
                  ></div>

                  {/* CTA — slides in on hover */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400 ease-out">
                    <span className="text-white text-xs font-semibold tracking-widest uppercase">
                      Explore Collection
                    </span>
                    <svg className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-cream/40 py-16 border-t border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-end gap-2 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-primary">Best Sellers</h2>
              <p className="text-gray-500 text-sm mt-1">Our most loved Ayurvedic formulations.</p>
            </div>
            <Link to="/shop" className="text-primary hover:text-secondary-dark font-semibold text-sm flex items-center gap-1 group shrink-0">
              <span>View All</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-cream h-[380px] animate-pulse rounded-sm"></div>
              ))}
            </div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {bestSellers.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isProductInWishlist(prod._id)}
                  />
                ))}
              </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-b border-cream-dark">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-serif text-primary">The Purity Promise</h2>
          <div className="h-0.5 w-16 bg-secondary mx-auto mt-3"></div>
          <p className="text-gray-500 text-sm mt-3">
            Every product is hand-brewed at our carbon-neutral farms following authenticated Vedic recipes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-cream-light p-8 text-center border border-cream-dark space-y-4">
            <div className="bg-accent text-primary w-12 h-12 flex items-center justify-center rounded-full mx-auto">
              <Leaf size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-primary">100% Certified Organic</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We source raw ingredients directly from local tribal cooperatives. Free from parabens, silicones, and synthetic dyes.
            </p>
          </div>

          <div className="bg-cream-light p-8 text-center border border-cream-dark space-y-4">
            <div className="bg-accent text-primary w-12 h-12 flex items-center justify-center rounded-full mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-primary">Vedic Authenticity</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              All botanical concentrates are slow-brewed using traditional methods, retaining maximum nutrient density.
            </p>
          </div>

          <div className="bg-cream-light p-8 text-center border border-cream-dark space-y-4">
            <div className="bg-accent text-primary w-12 h-12 flex items-center justify-center rounded-full mx-auto">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-primary">Handcrafted Luxury</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Produced in small batches to preserve freshness and effectiveness. Beautiful glass packaging that is fully recyclable.
            </p>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-cream-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-end gap-2 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-primary">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Direct from our botanical farms.</p>
            </div>
            <Link to="/shop?sortBy=newest" className="text-primary hover:text-secondary-dark font-semibold text-sm flex items-center gap-1 group shrink-0">
              <span>View All</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-cream h-[380px] animate-pulse rounded-sm"></div>
              ))}
            </div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isProductInWishlist(prod._id)}
                  />
                ))}
              </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Slider */}
      <section className="bg-cream py-16 border-t border-cream-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-serif text-primary mb-2">Loved by Thousands</h2>
          <div className="h-0.5 w-16 bg-secondary mx-auto mb-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-white p-6 border border-cream-dark shadow-sm relative">
                <div className="flex text-secondary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(test.rating) ? 'fill-secondary text-secondary' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic leading-relaxed mb-4">"{test.comment}"</p>
                <div className="mt-auto">
                  <h4 className="font-serif text-sm font-bold text-primary">{test.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
