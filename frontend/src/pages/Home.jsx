import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Leaf, Sparkles, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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

const slideVariants = {
  enter: {
    opacity: 0,
    scale: 0.98
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.products);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
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
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [currentIndex]);

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
            if (Array.isArray(p.images)) {
              p.images = p.images.map(img =>
                (typeof img === 'string' && img.includes('unsplash.com'))
                  ? img.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=90')
                  : (img || '')
              );
            } else {
              p.images = [];
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
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  const handleDotClick = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const categoryFallbackImages = {
    'skin-care':          'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'hair-care':          'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a3ef?q=80&w=600&auto=format&fit=crop',
    'bath-body':          'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop',
    'fragrance-wellness': 'https://images.unsplash.com/photo-1602930044438-4b2a362a9870?q=80&w=600&auto=format&fit=crop',
  };

  const getCategoryImage = (cat) => {
    if (!cat.image) return categoryFallbackImages[cat.slug] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600';
    if (cat.image.startsWith('http://') || cat.image.startsWith('https://')) {
      return cat.image;
    }
    return `http://127.0.0.1:5000/${cat.image.replace(/^\//, '')}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden w-full py-4 sm:py-6 bg-[#fdfbf9] min-h-[340px] sm:min-h-[440px] md:min-h-[540px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-[300px] sm:h-[380px] md:h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-y-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F0E6DD]/60 flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 md:p-12"
              style={{
                backgroundColor: heroSlides[currentIndex].bgColor,
                background: `radial-gradient(circle at 75% 20%, rgba(255,255,255,0.45) 0%, transparent 65%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.2) 0%, transparent 50%), ${heroSlides[currentIndex].bgColor}`,
                boxShadow: '0 20px 40px -15px rgba(28, 63, 36, 0.05)'
              }}
            >
              {/* Floating background details for decoration */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="leaf-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 5c0 8.3-6.7 15-15 15s-15-6.7-15-15S-3.3-10 5-10s15 6.7 15 15z" fill="currentColor" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
                </svg>
              </div>

              {/* Mobile background overlay */}
              <div className="absolute inset-0 block md:hidden opacity-[0.08] pointer-events-none">
                <img
                  src={heroSlides[currentIndex].image}
                  alt=""
                  className="w-full h-full object-cover filter blur-[1px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Left Content */}
              <div className="flex-1 space-y-3.5 sm:space-y-6 text-left z-10 max-w-lg">
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-[#C89B7B] text-xs font-serif">✦</span>
                  <span className="text-[#8B5E3C] font-extrabold tracking-[0.25em] text-[10px] sm:text-xs uppercase block">
                    {heroSlides[currentIndex].subtitle}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-[#2E1E1C] leading-tight drop-shadow-sm">
                  {heroSlides[currentIndex].title}
                </h1>
                
                {/* Discount Badge */}
                <div className="inline-flex flex-wrap items-center gap-2 sm:gap-4 my-1.5">
                  <span className="bg-gradient-to-r from-[#4A2E2B] to-[#5C3A36] text-[#FAF7F2] text-xs sm:text-sm font-black px-4 py-1.5 rounded-full tracking-wider shadow-sm uppercase">
                    {heroSlides[currentIndex].discount}
                  </span>
                  {heroSlides[currentIndex].promoCode && (
                    <span className="border border-dashed border-[#8B5E3C]/85 text-[#8B5E3C] text-[10px] sm:text-xs font-bold px-3 py-1 bg-white/40 rounded-full">
                      USE CODE: <span className="font-extrabold text-[#4A2E2B]">{heroSlides[currentIndex].promoCode}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#5C4033]/90 font-medium leading-relaxed max-w-md hidden sm:block">
                  {heroSlides[currentIndex].description}
                </p>

                <div className="pt-2 sm:pt-4">
                  <Link
                    to={heroSlides[currentIndex].link}
                    className="bg-[#2E1E1C] hover:bg-[#4E3430] hover:shadow-lg hover:scale-102 transition-all duration-300 text-[#FAF7F2] px-6 py-3 font-bold text-xs rounded-full uppercase tracking-wider inline-flex items-center gap-2 group"
                  >
                    <span>Explore Now</span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="absolute right-0 top-0 bottom-0 w-[45%] hidden md:block overflow-hidden rounded-r-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FAF7F2]/10 z-10"></div>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-24 z-10"
                  style={{
                    background: `linear-gradient(to right, ${heroSlides[currentIndex].bgColor}, transparent)`
                  }}
                ></div>
                <motion.img
                  key={heroSlides[currentIndex].image}
                  initial={{ scale: 1.08, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  src={heroSlides[currentIndex].image}
                  alt={heroSlides[currentIndex].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Chevron Navigation */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-12 sm:left-16 top-1/2 -translate-y-1/2 z-20 bg-white/85 hover:bg-white text-[#2E1E1C] hover:text-[#C5A880] border border-[#FAF7F2] p-3 rounded-full shadow-premium hover:scale-110 transition-all duration-300 focus:outline-none items-center justify-center"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-12 sm:right-16 top-1/2 -translate-y-1/2 z-20 bg-white/85 hover:bg-white text-[#2E1E1C] hover:text-[#C5A880] border border-[#FAF7F2] p-3 rounded-full shadow-premium hover:scale-110 transition-all duration-300 focus:outline-none items-center justify-center"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2.5 mt-6">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-[4px] rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentIndex ? 'bg-[#0F5132] w-7' : 'bg-[#E5DCD3] hover:bg-[#8B5E3C] w-3.5'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
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
                className="group relative block overflow-hidden rounded-2xl border border-[#FAF7F2] shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-white"
                style={{ height: 'clamp(220px, 40vw, 440px)' }}
              >
                {/* Thin inside frame for art-gallery editorial feel */}
                <div className="absolute inset-2 sm:inset-3 border border-white/10 z-20 pointer-events-none group-hover:border-[#C8A882]/30 transition-all duration-500 rounded-lg"></div>

                {/* Top dynamic label badge */}
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20">
                  <span
                    className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white backdrop-blur-md border border-white/20 transition-all duration-500"
                    style={{ backgroundColor: accent + 'AA' }}
                  >
                    {label}
                  </span>
                </div>

                {/* Category Image */}
                <img
                  src={getCategoryImage(cat)}
                  alt={cat.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = categoryFallbackImages[cat.slug] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600';
                  }}
                  className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Dark atmospheric overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 z-10 transition-opacity duration-500 group-hover:opacity-90"></div>

                {/* Elegant glow panel that matches theme color on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 z-10"
                  style={{ backgroundColor: accent }}
                ></div>

                {/* Glassmorphism Editorial Card at bottom */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 bg-white/[0.07] backdrop-blur-md border border-white/10 p-2.5 sm:p-4 rounded-xl group-hover:bg-white/[0.13] group-hover:border-white/20 transition-all duration-500 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                    <div className="text-center sm:text-left">
                      <span className="hidden sm:block text-[9px] font-bold tracking-[0.25em] text-[#C8A882] mb-1">
                        0{idx + 1} / {cat.slug?.replace('-', ' ').toUpperCase()}
                      </span>
                      <h3 className="font-serif text-white text-[13px] sm:text-lg font-bold leading-tight drop-shadow-sm group-hover:text-[#FAF7F2] transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/10 border border-white/10 items-center justify-center text-white group-hover:bg-[#C8A882] group-hover:text-black group-hover:border-[#C8A882] transition-all duration-500 shadow-md shrink-0">
                      <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
