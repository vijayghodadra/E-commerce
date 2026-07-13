import React from 'react';
import { Leaf, Award, Heart, ShieldAlert, Sparkles, Smile } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero Intro */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-secondary font-bold text-xs uppercase tracking-widest block">Our Genesis</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary">Rooted in Purity, Crafted by Wisdom</h1>
        <div className="h-0.5 w-16 bg-secondary mx-auto mt-4"></div>
        <p className="text-gray-500 text-sm leading-relaxed pt-2">
          Botanicals was born out of a desire to reclaim ancient beauty rituals and simplify them for the modern world. We slow-brew organic skincare and haircare formulations directly on our solar-powered organic farms.
        </p>
      </section>

      {/* Main split row */}
      <section className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-serif font-bold text-primary">Farm-to-Face Skincare</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Unlike mass-manufactured cosmetics, our products are brewed in small batches to preserve nutrient integrity. We use steam-distilled Kannauj rosewater, cold-pressed almond oil, and handpicked Kashmiri saffron.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            By eliminating synthetic stabilizers, sulfate surfactants, and chemical preservatives, we create clean concentrates that work with your skin's natural pH and cellular barrier, promoting long-term botanical health.
          </p>
        </div>
        <div className="flex-1 w-full h-[400px] border border-cream-dark overflow-hidden rounded-sm bg-cream-light">
          <img
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop"
            alt="Organic beauty ingredients"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Three Pillars grid */}
      <section className="bg-cream p-10 md:p-16 border border-cream-dark text-center space-y-12">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary">The Three Pillars of Botanicals</h2>
          <div className="h-0.5 w-12 bg-secondary mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Leaf size={24} />
            </div>
            <h3 className="font-serif text-base font-bold text-primary">Purity & Cleanliness</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              We never use parabens, silicones, synthetic colors, or heavy metals. Every ingredient is 100% biodegradable and certified organic.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Award size={24} />
            </div>
            <h3 className="font-serif text-base font-bold text-primary">Fair Sourcing</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              We partner directly with small-holder farming cooperatives and tribal families, paying fair trade premiums to support local rural economies.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-base font-bold text-primary">Carbon Neutrality</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Our packaging is 100% recyclable, glass-first, and our slow-brewing facility operates on 100% renewable solar energy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
