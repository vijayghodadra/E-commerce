import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="relative inline-block">
        <Leaf size={64} className="text-secondary mx-auto animate-pulse" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-3xl font-bold text-primary">
          404
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Lost in the Woods?</h1>
        <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
          The formulation or page you are looking for has been moved, archived, or is currently brewing in our workshops.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary text-xs flex items-center justify-center space-x-1">
          <span>Return Home</span>
        </Link>
        <Link to="/shop" className="btn-outline text-xs flex items-center justify-center space-x-1">
          <span>Explore Shop</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
