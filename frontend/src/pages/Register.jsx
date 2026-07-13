import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { authStart, authSuccess, authFailure, clearAuthError } from '../store/slices/authSlice';
import API from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { token, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
    dispatch(clearAuthError());
  }, [token, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    dispatch(authStart());
    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        phone,
        password,
      });

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
        showToast(`Welcome to Botanicals, ${user.name}!`);
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your credentials or try a different email.';
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
            Start Your Ritual
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C3F24] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Join us to unlock free shipping coupons, checkout faster, and save your favorites.
          </p>
        </div>

        {error && (
          <div className="bg-[#FFF5F5] border border-[#FEB2B2] text-[#C53030] px-4 py-3 text-xs rounded-md flex items-start space-x-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vijay Kumar"
                required
                className="w-full bg-[#FAFCFA] border border-[#DCE6E1] text-xs pl-10 pr-4 py-3 rounded-[4px] focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] transition-all text-gray-800 font-medium"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Email Address *
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

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone size={15} className="absolute left-3.5 text-gray-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-[#FAFCFA] border border-[#DCE6E1] text-xs pl-10 pr-4 py-3 rounded-[4px] focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] transition-all text-gray-800 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
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
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#E3ECE6] text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0F5132] hover:text-[#0c4027] font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
