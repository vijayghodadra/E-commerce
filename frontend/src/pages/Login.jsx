import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { authStart, authSuccess, authFailure, clearAuthError } from '../store/slices/authSlice';
import API from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Parse redirect path
  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
    // Clear any previous error on mount
    dispatch(clearAuthError());
  }, [token, navigate, from, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    dispatch(authStart());
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        // Backend returns user fields flat on res.data (not nested under res.data.user)
        const user = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          phone: res.data.phone,
        };
        dispatch(
          authSuccess({
            user,
            token: res.data.token,
          })
        );
        showToast(`Welcome back, ${user.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      dispatch(authFailure(msg));
      showToast(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#F4FAF7] via-white to-[#FDFBF7] py-16 px-4">
      <div className="w-full max-w-md bg-white border border-[#E3ECE6] p-8 md:p-10 rounded-lg shadow-premium space-y-6 relative overflow-hidden">
        
        {/* Subtle Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0F5132]"></div>

        <div className="text-center space-y-2.5">
          <div className="flex justify-center mb-1">
            <span className="text-[26px]">🌿</span>
          </div>
          <span className="text-[#0F5132] font-bold text-xs uppercase tracking-widest block font-sans">
            Account Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C3F24] tracking-tight">
            Login to Botanicals
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Access your saved favorites, address book, and active orders.
          </p>
        </div>

        {error && (
          <div className="bg-[#FFF5F5] border border-[#FEB2B2] text-[#C53030] px-4 py-3 text-xs rounded-md flex items-start space-x-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vijay@example.com"
                required
                className="w-full bg-[#FAFCFA] border border-[#DCE6E1] text-xs pl-10 pr-4 py-3 rounded-[4px] focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] transition-all text-gray-800 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-[10px] text-gray-400 hover:text-[#0F5132] font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#FAFCFA] border border-[#DCE6E1] text-xs pl-10 pr-10 py-3 rounded-[4px] focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] transition-all text-gray-800 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-[#0F5132]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F5132] hover:bg-[#0c4027] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-[4px] flex justify-center items-center space-x-2 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#E3ECE6] text-xs text-gray-500">
          New to Botanicals?{' '}
          <Link to="/register" className="text-[#0F5132] hover:text-[#0c4027] font-bold">
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials Alert */}
        <div className="bg-[#FAFCFA] p-3 border border-[#E3ECE6] rounded-[4px] text-[10px] text-gray-500 space-y-1">
          <span className="font-bold flex items-center mb-0.5 text-[#1C3F24]">
            <ShieldCheck size={13} className="mr-1 text-[#0F5132]" /> Seeded Accounts (Password: password123)
          </span>
          <p>• Customer: <span className="font-semibold select-all text-[#0F5132]">vijay@example.com</span></p>
          <p>• Admin Panel: <span className="font-semibold select-all text-[#0F5132]">admin@example.com</span></p>
        </div>
      </div>
    </div>
  );
}
