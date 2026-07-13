import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    wishlistStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    wishlistSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products || [];
      state.error = null;
    },
    wishlistFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearWishlist: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  wishlistStart,
  wishlistSuccess,
  wishlistFailure,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
