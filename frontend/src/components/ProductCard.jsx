import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  if (!product) return null;

  const discountAmount = product.price - product.discountPrice;
  const isDiscounted = product.discountPrice > 0;
  const activePrice = isDiscounted ? product.discountPrice : product.price;

  // Determine mock benefit subtitle based on tags or category name
  const getTagline = () => {
    if (product.category?.name === 'Skin Care' || product.category === 'skin-care') {
      return 'Nurtures & Repairs | Moisturises';
    }
    if (product.category?.name === 'Hair Care' || product.category === 'hair-care') {
      return 'Controls Hair Fall | Mildly Foaming | Non-drying';
    }
    return 'Weightless-matte | Hydrating | Long-lasting';
  };

  // Determine mock size variants
  const getVariants = () => {
    if (product.category?.name === 'Skin Care' || product.category === 'skin-care') {
      return ['50g x Pack of 1', '100g x Pack of 2'];
    }
    if (product.category?.name === 'Hair Care' || product.category === 'hair-care') {
      return ['200ml x Pack of 1', '200ml x Pack of 2'];
    }
    return ['16 shades x Pack of 1', '16 shades x Pack of 2'];
  };

  return (
    <div className="bg-white border border-[#EDEDED] rounded-[16px] relative flex flex-col justify-between h-full p-4 hover:shadow-md transition-shadow group duration-300">
      
      {/* Top Left Save Badge */}
      {isDiscounted && (
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-[#E7F6EE] text-[#0F5132] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full">
            Save ₹{discountAmount}
          </span>
        </div>
      )}

      {/* Top Right Best Seller Badge */}
      {product.rating >= 4.5 && (
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-[#E2ECE6] text-[#2E4A3F] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-[4px] uppercase tracking-wide">
            Best Seller
          </span>
        </div>
      )}

      {/* Wishlist Button - Raw outline icon matching reference */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist(product._id);
        }}
        className={`absolute z-20 text-gray-900 hover:text-red-500 transition-colors ${
          product.rating >= 4.5 ? 'top-12 right-4' : 'top-4 right-4'
        }`}
      >
        <Heart
          size={19}
          strokeWidth={1.5}
          className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-900'}
        />
      </button>

      {/* Image Container - Aspect Square & Centered with White Background */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative overflow-hidden aspect-square w-full bg-white rounded-[12px] shrink-0 mb-3 flex items-center justify-center"
      >
        <img
          src={product.images && product.images[0] ? (product.images[0].includes('unsplash.com') ? product.images[0].replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=90') : product.images[0]) : ''}
          alt={product.name}
          className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {product.stockStatus === 'out_of_stock' && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-[12px]">
            <span className="bg-primary text-cream text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info details */}
      <div className="flex-grow flex flex-col justify-between mt-1">
        <div className="space-y-1">
          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#0F5132] transition-colors min-h-[40px] leading-snug tracking-tight font-sans">
              {product.name}
            </h3>
          </Link>

          {/* Benefit tagline */}
          <p className="text-xs text-[#0F5132] font-normal leading-relaxed mt-1 block truncate">
            {getTagline()}
          </p>

          {/* Ratings */}
          <div className="flex items-center space-x-1 mt-2">
            <Star size={13} className="fill-[#F5A623] text-[#F5A623]" />
            <span className="text-xs font-bold text-gray-800">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>

          {/* Size Variant Selector Pills */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {getVariants().map((variant, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-medium px-3 py-1 rounded-full border transition-all ${
                  idx === 0 
                    ? 'bg-white border-[#0F5132] text-[#0F5132]' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {variant}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing and Add button */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#F3F9F6] border border-[#0F5132] text-xs sm:text-sm font-bold text-gray-900 px-3 py-1 rounded-full">
              ₹{activePrice}
            </span>
            {isDiscounted && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product._id)}
            disabled={product.stockStatus === 'out_of_stock'}
            className="bg-[#2D6A4F] hover:bg-[#1B4332] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs px-5 py-1.5 rounded-full transition-colors"
          >
            Add
          </button>
        </div>
      </div>

    </div>
  );
}
