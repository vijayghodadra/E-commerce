import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import API from '../services/api';

export default function ForgotPassword() {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        showToast('Password reset link dispatched!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dispatch reset link', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-cream-dark p-8 md:p-10 rounded-sm shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-secondary font-bold text-xs uppercase tracking-widest block">Reset Session</span>
          <h1 className="text-2xl font-serif font-bold text-primary">Recover Password</h1>
          <div className="h-0.5 w-12 bg-secondary mx-auto mt-2"></div>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-4 rounded-sm leading-relaxed">
              We have dispatched a simulated password recovery email to <strong>{email}</strong>. Check your console logs or database entry to retrieve the token!
            </div>
            <Link to="/login" className="btn-primary text-xs w-full justify-center flex items-center space-x-2 py-3">
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-500 font-sans leading-relaxed text-center">
              Enter your registered email below, and we will dispatch recovery links containing unique security tokens.
            </p>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vijay@example.com"
                  required
                  className="w-full bg-cream-light border border-cream-dark text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary text-xs uppercase tracking-wider py-3 flex justify-center items-center space-x-2"
            >
              <span>{submitting ? 'Sending Link...' : 'Request Recovery Link'}</span>
              <Send size={12} />
            </button>

            <Link
              to="/login"
              className="text-xs text-gray-400 hover:text-primary font-bold flex items-center justify-center space-x-1.5 pt-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
