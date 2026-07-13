import { createSlice } from '@reduxjs/toolkit';

const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined') return null;
    return JSON.parse(storedUser);
  } catch (error) {
    return null;
  }
};

const getTokenFromStorage = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined') return null;
  return token;
};

const token = getTokenFromStorage();
const user = getUserFromStorage();

const initialState = {
  user,
  token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  updateProfileSuccess,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
