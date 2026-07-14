import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';

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

  const getTagline = () => {
    if (product.category?.name === 'Skin Care') return 'Nurtures & Repairs | Moisturises';
    if (product.category?.name === 'Hair Care') return 'Controls Hair Fall | Non-Drying';
    if (product.category?.name === 'Bath & Body') return 'Hydrates & Softens | Natural';
    return 'Calming | Aromatic | Pure';
  };

  return (
    <div className="bg-white border border-[#EDEDED] rounded-2xl relative flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group">

      {/* Badges Row */}
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start pointer-events-none">
        {isDiscounted ? (
          <span className="bg-[#E7F6EE] text-[#0F5132] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Save ₹{discountAmount}
          </span>
        ) : <span />}
        {((product.rating || 0) >= 4.5) && (
          <span className="bg-[#E2ECE6] text-[#2E4A3F] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleWishlist(product._id); }}
        className="absolute z-20 bottom-[88px] right-3 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm border border-gray-100 hover:scale-110 transition-transform"
        aria-label="Toggle wishlist"
      >
        <Heart
          size={16}
          strokeWidth={1.8}
          className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
        />
      </button>

      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative bg-[#FAFAFA] shrink-0"
        style={{ paddingBottom: '100%' }}
      >
        <img
          src={
            (Array.isArray(product.images) && typeof product.images[0] === 'string')
              ? product.images[0].includes('unsplash.com')
                ? product.images[0].replace(/w=\d+/, 'w=800').replace(/q=\d+/, 'q=85')
                : product.images[0]
              : 'https://placehold.co/400x400?text=No+Image'
          }
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stockStatus === 'out_of_stock' && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[#2D4A3F] text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 pt-2 gap-1">
        {/* Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-[#0F5132] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Tagline */}
        <p className="text-[11px] text-[#0F5132] leading-tight truncate">{getTagline()}</p>

        {/* Stars */}
        <div className="flex items-center gap-1">
          <Star size={11} className="fill-[#F5A623] text-[#F5A623] shrink-0" />
          <span className="text-[11px] font-bold text-gray-800">{(product.rating || 0).toFixed(1)}</span>
          <span className="text-[11px] text-gray-400">({product.numReviews || 0})</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + Add Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="bg-[#F3F9F6] border border-[#0F5132] text-[12px] font-bold text-gray-900 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              ₹{activePrice}
            </span>
            {isDiscounted && (
              <span className="text-[11px] text-gray-400 line-through whitespace-nowrap">₹{product.price}</span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product._id)}
            disabled={product.stockStatus === 'out_of_stock'}
            className="shrink-0 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-[11px] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <ShoppingBag size={11} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
