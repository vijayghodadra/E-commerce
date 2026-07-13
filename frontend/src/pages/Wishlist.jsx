import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Trash, ShoppingBag, Star } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { wishlistSuccess, wishlistStart, wishlistFailure } from '../store/slices/wishlistSlice';
import { cartSuccess } from '../store/slices/cartSlice';
import API from '../services/api';

export default function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const { products, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (!token) {
      showToast('Please login to view your wishlist', 'error');
      navigate('/login');
      return;
    }

    const fetchWishlist = async () => {
      dispatch(wishlistStart());
      try {
        const res = await API.get('/cart-wishlist/wishlist');
        if (res.data.success) {
          dispatch(wishlistSuccess({ products: res.data.wishlist.products }));
        }
      } catch (err) {
        dispatch(wishlistFailure(err.response?.data?.message || err.message));
      }
    };
    fetchWishlist();
  }, [token, dispatch, navigate]);

  const handleRemove = async (productId) => {
    try {
      const res = await API.post('/cart-wishlist/wishlist/toggle', { productId });
      if (res.data.success) {
        dispatch(wishlistSuccess({ products: res.data.wishlist.products }));
        showToast('Removed from wishlist');
      }
    } catch (err) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  const handleAddToBag = async (productId) => {
    try {
      const res = await API.post('/cart-wishlist/cart/add', { productId, qty: 1 });
      if (res.data.success) {
        dispatch(cartSuccess({ items: res.data.cart.items }));
        showToast('Added to bag successfully!');
        // Remove from wishlist automatically after adding to bag (standard user-friendly flow!)
        handleRemove(productId);
      }
    } catch (err) {
      showToast('Failed to add to bag', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-cream-dark pb-6 mb-10">
        <h1 className="text-3xl font-serif font-bold text-primary flex items-center">
          <Heart className="mr-3 fill-primary" /> My Wishlist
        </h1>
        <p className="text-gray-500 text-xs mt-2">Saved items waiting for your ritual routines.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-cream h-[350px] rounded-sm"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-cream-light/30 border border-cream-dark rounded-sm space-y-4">
          <div className="bg-cream w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
            <Heart size={32} />
          </div>
          <h3 className="font-serif text-lg font-bold text-primary">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">Explore our range of botanical formulations and tap the heart icon to save products here.</p>
          <Link to="/shop" className="btn-primary text-xs">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((prod) => {
            if (!prod) return null;
            const activePrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
            return (
              <div key={prod._id} className="card-premium group relative flex flex-col justify-between h-full">
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(prod._id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700 rounded-full shadow-sm z-20"
                  title="Remove"
                >
                  <Trash size={14} />
                </button>

                <div>
                  <Link to={`/product/${prod.slug}`} className="block relative overflow-hidden h-60 bg-cream-light">
                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="p-4">
                    {/* Rating */}
                    {prod.rating > 0 && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Star size={10} className="text-secondary fill-secondary" />
                        <span className="text-[10px] font-bold text-primary">{prod.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <Link to={`/product/${prod.slug}`}>
                      <h3 className="font-serif text-sm font-bold text-primary line-clamp-1 hover:text-secondary-dark">
                        {prod.name}
                      </h3>
                    </Link>
                    <div className="text-sm font-bold text-wood mt-2">Rs. {activePrice}</div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToBag(prod._id)}
                    disabled={prod.stockStatus === 'out_of_stock'}
                    className="w-full bg-primary hover:bg-primary-light disabled:bg-gray-200 disabled:text-gray-400 text-cream font-medium tracking-wide uppercase text-xs py-2.5 transition-colors text-center inline-block"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
