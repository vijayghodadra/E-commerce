import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShieldAlert, Heart, ShoppingBag, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { cartSuccess } from '../store/slices/cartSlice';
import { wishlistSuccess } from '../store/slices/wishlistSlice';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.products);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Accordion Toggles
  const [accordionOpen, setAccordionOpen] = useState({
    desc: true,
    ingredients: false,
    usage: false,
  });

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Hover Zoom state
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/products/${slug}`);
        if (res.data.success) {
          const prodData = res.data.product;
          if (prodData.images) {
            prodData.images = prodData.images.map(img => img.includes('unsplash.com') ? img.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=90') : img);
          }
          setProduct(prodData);
          setActiveImage(prodData.images[0] || '');
          setQty(1);

          // Fetch related products
          if (prodData.category) {
            const relRes = await API.get(`/products/related/${prodData.category._id}/${prodData._id}`);
            if (relRes.data.success) {
              const cleanedRelated = (relRes.data.products || []).map(p => {
                if (p.images) {
                  p.images = p.images.map(img => img.includes('unsplash.com') ? img.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=90') : img);
                }
                return p;
              });
              setRelatedProducts(cleanedRelated);
            }
          }
        }
      } catch (err) {
        showToast('Product not found', 'error');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleQtyChange = (val) => {
    const newVal = qty + val;
    if (newVal > 0 && newVal <= (product?.inventoryCount || 10)) {
      setQty(newVal);
    }
  };

  const handleAddToCart = async (prodId = product._id, quantity = qty) => {
    if (!token) {
      showToast('Please login to checkout', 'error');
      navigate('/login');
      return;
    }
    try {
      const res = await API.post('/cart-wishlist/cart/add', { productId: prodId, qty: quantity });
      if (res.data.success) {
        dispatch(cartSuccess({ items: res.data.cart.items }));
        showToast('Added to bag successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to bag', 'error');
    }
  };

  const handleToggleWishlist = async (prodId = product._id) => {
    if (!token) {
      showToast('Please login to update wishlist', 'error');
      navigate('/login');
      return;
    }
    try {
      const res = await API.post('/cart-wishlist/wishlist/toggle', { productId: prodId });
      if (res.data.success) {
        dispatch(wishlistSuccess({ products: res.data.wishlist.products }));
        showToast(res.data.isAdded ? 'Added to wishlist!' : 'Removed from wishlist');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  const isProductInWishlist = (prodId = product?._id) => {
    return Array.isArray(wishlist) && wishlist.some((p) => p && (p._id === prodId || p === prodId));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await API.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.data.success) {
        showToast('Review submitted successfully!');
        setReviewTitle('');
        setReviewComment('');
        
        // Reload product details to see review
        const updated = await API.get(`/products/${slug}`);
        if (updated.data.success) {
          setProduct(updated.data.product);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Image Magnifying Logic on hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row gap-10">
        <div className="flex-1 bg-white h-[400px] border border-cream animate-pulse"></div>
        <div className="flex-1 space-y-6">
          <div className="h-8 bg-cream animate-pulse w-3/4"></div>
          <div className="h-6 bg-cream animate-pulse w-1/4"></div>
          <div className="h-24 bg-cream animate-pulse w-full"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountRate = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="text-[10px] sm:text-[11px] font-bold text-[#8B5E3C] mb-8 uppercase tracking-widest flex items-center space-x-1.5">
        <Link to="/" className="hover:text-[#0F5132] transition-colors">Home</Link>
        <span className="text-gray-300 font-normal">/</span>
        <Link to="/shop" className="hover:text-[#0F5132] transition-colors">Shop</Link>
        <span className="text-gray-300 font-normal">/</span>
        <span className="text-gray-400 font-normal truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery with Zoom */}
        <div className="space-y-4">
          <div className="relative border border-gray-100 bg-white overflow-hidden rounded-[16px] h-[400px] sm:h-[500px] shadow-sm flex items-center justify-center">
            {/* Primary Image */}
            <img
              src={activeImage}
              alt={product.name}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="max-h-[90%] max-w-[90%] object-contain cursor-zoom-in"
            />
            {/* Hover Zoom overlay panel */}
            <div
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-[length:200%] border border-gray-100 rounded-[16px] shadow-premium bg-white"
              style={{
                ...zoomStyle,
                zIndex: 10,
              }}
            ></div>

            {/* Discount Badge */}
            {discountRate > 0 && (
              <span className="absolute top-4 left-4 bg-[#E7F6EE] text-[#0F5132] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Save {discountRate}%
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 border overflow-hidden rounded-[8px] transition-all shrink-0 ${
                    activeImage === img ? 'border-[#0F5132] shadow-sm ring-1 ring-[#0F5132]' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information Panel */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[#8B5E3C] font-black tracking-widest text-[10px] sm:text-xs uppercase block">
              {product.brand || 'Pure Botanical'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#4A2E2B] leading-tight">
              {product.name}
            </h1>
            
            {/* Ratings Summary */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="flex text-[#F5A623]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-medium">({product.numReviews} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-4 border-t border-b border-gray-100 flex items-center space-x-3">
            <span className="bg-[#F3F9F6] border border-[#0F5132] text-xl sm:text-2xl font-extrabold text-[#0F5132] px-4 py-1.5 rounded-full">
              Rs. {activePrice}
            </span>
            {product.discountPrice > 0 && (
              <>
                <span className="text-base text-gray-400 line-through">Rs. {product.price}</span>
                <span className="text-xs font-bold text-[#0F5132] bg-[#E7F6EE] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {discountRate}% Off
                </span>
              </>
            )}
            <span className="text-xs text-[#0F5132] font-semibold bg-[#F3F9F6] px-2 py-0.5 rounded-sm">Inclusive of all taxes</span>
          </div>

          <p className="text-gray-600 text-sm font-sans leading-relaxed">
            {product.shortDescription || 'Experience the purity of this authentic formulation prepared using classical Ayurvedic text guidelines.'}
          </p>

          {/* Premium Highlights */}
          <div className="grid grid-cols-3 gap-3 py-4 border-b border-gray-100">
            <div className="flex flex-col items-center justify-center p-3 bg-[#FDFBF9] rounded-[12px] border border-[#F0E6DD]">
              <span className="text-[20px]">🌱</span>
              <span className="text-[9px] font-bold text-[#4A2E2B] uppercase tracking-wider mt-1 text-center">100% Vegan</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[#FDFBF9] rounded-[12px] border border-[#F0E6DD]">
              <span className="text-[20px]">🐰</span>
              <span className="text-[9px] font-bold text-[#4A2E2B] uppercase tracking-wider mt-1 text-center">Cruelty Free</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[#FDFBF9] rounded-[12px] border border-[#F0E6DD]">
              <span className="text-[20px]">🔬</span>
              <span className="text-[9px] font-bold text-[#4A2E2B] uppercase tracking-wider mt-1 text-center">Toxin Free</span>
            </div>
          </div>

          {/* Stock Level flags */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-gray-700">Availability:</span>
            {product.stockStatus === 'out_of_stock' ? (
              <span className="text-red-500 font-bold flex items-center space-x-1">
                <ShieldAlert size={14} />
                <span>Out of Stock</span>
              </span>
            ) : product.inventoryCount <= 5 ? (
              <span className="text-orange-500 font-bold uppercase tracking-wider">
                Only {product.inventoryCount} left in stock!
              </span>
            ) : (
              <span className="text-green-600 font-bold uppercase tracking-wider">In Stock</span>
            )}
          </div>

          {/* Quantity Selector and Action buttons */}
          {product.stockStatus !== 'out_of_stock' && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* Qty Selector */}
              <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-white shadow-sm w-fit">
                <button
                  onClick={() => handleQtyChange(-1)}
                  className="p-2 text-[#4A2E2B] hover:text-[#0F5132] transition-colors"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="px-4 text-sm font-bold text-gray-800">{qty}</span>
                <button
                  onClick={() => handleQtyChange(1)}
                  className="p-2 text-[#4A2E2B] hover:text-[#0F5132] transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                onClick={() => handleAddToCart(product._id, qty)}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-full font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 flex-1 flex justify-center items-center space-x-2 py-3 px-6 shadow-sm hover:shadow-md"
              >
                <ShoppingBag size={18} />
                <span>Add to Shopping Bag</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => handleToggleWishlist(product._id)}
                className={`p-3 rounded-full border transition-all ${
                  isProductInWishlist() ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                title="Wishlist"
              >
                <Heart size={18} className={isProductInWishlist() ? 'fill-red-500' : ''} />
              </button>
            </div>
          )}

          {/* Accordion Panels (Desc, Ingredients, Usage) */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            {/* Description */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleAccordion('desc')}
                className="w-full flex justify-between items-center text-sm font-bold text-[#4A2E2B]"
              >
                <span className="font-serif">Vedic Description</span>
                {accordionOpen.desc ? <ChevronUp size={16} className="text-[#8B5E3C]" /> : <ChevronDown size={16} className="text-[#8B5E3C]" />}
              </button>
              {accordionOpen.desc && (
                <div className="text-xs text-gray-600 mt-3 font-sans leading-relaxed">
                  {product.description}
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleAccordion('ingredients')}
                className="w-full flex justify-between items-center text-sm font-bold text-[#4A2E2B]"
              >
                <span className="font-serif">Key Botanicals & Actives</span>
                {accordionOpen.ingredients ? <ChevronUp size={16} className="text-[#8B5E3C]" /> : <ChevronDown size={16} className="text-[#8B5E3C]" />}
              </button>
              {accordionOpen.ingredients && (
                <div className="text-xs text-gray-600 mt-3 font-sans leading-relaxed">
                  Infused with premium active ingredients such as cold-pressed Almond extract, pure Saffron threads, organic Honey concentrates, Aloe Vera pulps, and Ayurvedic roots to ensure organic nourishment and deep cell repair. Free from harmful petrochemicals, mineral oils, and sulfates.
                </div>
              )}
            </div>

            {/* Usage */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleAccordion('usage')}
                className="w-full flex justify-between items-center text-sm font-bold text-[#4A2E2B]"
              >
                <span className="font-serif">Ritual Application</span>
                {accordionOpen.usage ? <ChevronUp size={16} className="text-[#8B5E3C]" /> : <ChevronDown size={16} className="text-[#8B5E3C]" />}
              </button>
              {accordionOpen.usage && (
                <div className="text-xs text-gray-600 mt-3 font-sans leading-relaxed">
                  Gently massage a few drops onto a clean face and neck using upward strokes. Use daily as part of your evening skincare routine. For best results, follow with a cooling botanical mist.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20 border-t border-cream-dark pt-12">
        <h2 className="text-2xl font-serif font-bold text-primary mb-6">Customer Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a Review Form */}
          <div className="bg-cream-light p-6 border border-cream-dark rounded-sm h-fit">
            <h3 className="font-serif text-base font-bold text-primary mb-4">Write a Review</h3>
            {token ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Rating</label>
                  <div className="flex space-x-1.5 text-secondary">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={20}
                          className={star <= reviewRating ? 'fill-secondary text-secondary' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Review Title</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Refreshing mist"
                    className="w-full bg-white border border-cream-dark px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Comment</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this formulation..."
                    required
                    className="w-full bg-white border border-cream-dark px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full btn-primary text-xs tracking-wider"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-gray-500">You must be logged in to write a review.</p>
                <Link to="/login" className="btn-outline text-xs block py-2.5">
                  Login Now
                </Link>
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div className="md:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-cream-dark text-gray-400 text-sm">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="border-b border-cream-dark pb-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-primary">{rev.name}</h4>
                      <div className="flex text-secondary mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < rev.rating ? 'fill-secondary text-secondary' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {rev.title && <h5 className="font-sans text-xs font-semibold text-primary">{rev.title}</h5>}
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-cream-dark pt-12">
          <h2 className="text-2xl font-serif font-bold text-primary mb-8 text-center">Complete Your Ritual</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isProductInWishlist(prod._id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
