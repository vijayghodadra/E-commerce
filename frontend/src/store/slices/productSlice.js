import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  page: 1,
  pages: 1,
  count: 0,
  currentProduct: null,
  categories: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    productSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.page = action.payload.page;
      state.pages = action.payload.pages;
      state.count = action.payload.count;
      state.error = null;
    },
    singleProductSuccess: (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload;
      state.error = null;
    },
    categoriesSuccess: (state, action) => {
      state.categories = action.payload;
    },
    productFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
});

export const {
  productStart,
  productSuccess,
  singleProductSuccess,
  categoriesSuccess,
  productFailure,
  clearCurrentProduct,
} = productSlice.actions;

export default productSlice.reducer;
