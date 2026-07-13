import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  salesHistory: [],
  recentOrders: [],
  allOrders: [],
  allUsers: [],
  allCoupons: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    dashboardStatsSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload.stats;
      state.salesHistory = action.payload.salesHistory;
      state.recentOrders = action.payload.recentOrders;
      state.error = null;
    },
    adminOrdersSuccess: (state, action) => {
      state.loading = false;
      state.allOrders = action.payload;
      state.error = null;
    },
    adminUsersSuccess: (state, action) => {
      state.loading = false;
      state.allUsers = action.payload;
      state.error = null;
    },
    adminCouponsSuccess: (state, action) => {
      state.loading = false;
      state.allCoupons = action.payload;
      state.error = null;
    },
    adminFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  adminStart,
  dashboardStatsSuccess,
  adminOrdersSuccess,
  adminUsersSuccess,
  adminCouponsSuccess,
  adminFailure,
} = adminSlice.actions;

export default adminSlice.reducer;
