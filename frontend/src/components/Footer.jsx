import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Heart, Leaf } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-primary text-cream font-sans mt-auto">
      {/* Newsletter signup banner */}
      <div className="border-b border-primary-light py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h3 className="font-serif text-2xl font-bold text-cream mb-2">Join the Botanicals Circle</h3>
            <p className="text-sm text-cream/70 max-w-md">
              Subscribe to receive updates on new wellness collections, skincare secrets, and exclusive invitations to sales.
            </p>
          </div>
          <div className="md:w-1/2">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full bg-primary-dark/50 border border-primary-light px-4 py-3 text-cream placeholder-cream/40 focus:outline-none focus:border-secondary text-sm"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark text-cream font-semibold tracking-wider text-xs uppercase px-8 py-3 transition-colors shrink-0"
              >
                {subscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        {/* About Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-secondary tracking-wide">Botanicals ☘️</h4>
          <p className="text-cream/75 leading-relaxed">
            Crafting premium skincare, haircare, and wellness products rooted in the purity of nature and the wisdom of ancient botanicals. Free of parabens, phthalates, and synthetic cruelty.
          </p>
          <div className="flex space-x-3 text-xs pt-2">
            <span className="flex items-center space-x-1 text-cream/60">
              <ShieldCheck size={14} className="text-secondary" />
              <span>100% Certified</span>
            </span>
            <span className="flex items-center space-x-1 text-cream/60">
              <Leaf size={14} className="text-secondary" />
              <span>Cruelty Free</span>
            </span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-secondary tracking-wide">Collections</h4>
          <ul className="space-y-2.5 text-cream/80">
            <li><Link to="/shop?category=skin-care" className="hover:text-secondary transition-colors">Skin Care</Link></li>
            <li><Link to="/shop?category=hair-care" className="hover:text-secondary transition-colors">Hair Care</Link></li>
            <li><Link to="/shop?category=bath-body" className="hover:text-secondary transition-colors">Bath & Body</Link></li>
            <li><Link to="/shop?category=fragrance-wellness" className="hover:text-secondary transition-colors">Fragrance & Wellness</Link></li>
          </ul>
        </div>

        {/* Corporate Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-secondary tracking-wide">Quick Links</h4>
          <ul className="space-y-2.5 text-cream/80">
            <li><Link to="/shop" className="hover:text-secondary transition-colors">All Products</Link></li>
            <li><Link to="/about" className="hover:text-secondary transition-colors">Our Story & Farm</Link></li>
            <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Support</Link></li>
            <li><Link to="/login" className="hover:text-secondary transition-colors">Login / Register</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-secondary tracking-wide">Get in Touch</h4>
          <ul className="space-y-3 text-cream/80">
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-secondary shrink-0 mt-0.5" />
              <span>102 Organic Meadows, Vasant Kunj, New Delhi, India 110070</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={16} className="text-secondary shrink-0" />
              <span>+91 11-4090-8800</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={16} className="text-secondary shrink-0" />
              <span>support@botanicalsluxury.in</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-primary-dark/80 py-6 border-t border-primary-light/50 px-4 text-xs text-cream/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} Botanicals Luxury E-Commerce. All Rights Reserved. Inspired by premium botanical designs.
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart size={10} className="text-red-500 fill-red-500" />
            <span>in India. Pure Organic Ayurveda.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
