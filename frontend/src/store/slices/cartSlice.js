import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  coupon: null,
  discountAmount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cartSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.error = null;
    },
    cartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    applyCouponSuccess: (state, action) => {
      state.coupon = action.payload;
      state.discountAmount = action.payload.discountAmount;
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.discountAmount = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.discountAmount = 0;
      state.loading = false;
      state.error = null;
    },
  },
});

// Helper selectors
export const selectCartSubtotal = (state) => {
  return state.cart.items.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return sum + price * item.qty;
  }, 0);
};

export const selectCartTotals = (state) => {
  const subtotal = selectCartSubtotal(state);
  const discount = state.cart.discountAmount || 0;
  
  // Tax is 18% of subtotal after discount
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const tax = Number((0.18 * taxableSubtotal).toFixed(2));
  
  // Free shipping above Rs. 999 after discount, else Rs. 99
  const shipping = taxableSubtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = Number((taxableSubtotal + tax + shipping).toFixed(2));

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
  };
};

export const {
  cartStart,
  cartSuccess,
  cartFailure,
  applyCouponSuccess,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
