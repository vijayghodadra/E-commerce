import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Heart } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function Contact() {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('skin');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all required fields', 'error');
      return;
    }
    setSending(true);
    setTimeout(() => {
      showToast('Inquiry sent successfully! Our botanical care team will reply within 24 hours.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSending(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-secondary font-bold text-xs uppercase tracking-widest block">Contact Us</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary mt-1">Get in Touch</h1>
        <div className="h-0.5 w-16 bg-secondary mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Contact info details */}
        <div className="space-y-8 bg-cream p-8 md:p-12 border border-cream-dark rounded-sm">
          <div>
            <h3 className="font-serif text-lg font-bold text-primary mb-2 flex items-center">
              <MessageSquare className="mr-2 text-secondary" size={20} /> Client Care
            </h3>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Have questions about customized skincare regimens, order tracking, or corporate gifting packages? We are here to help.
            </p>
          </div>

          <div className="space-y-4 text-xs font-medium text-primary">
            <div className="flex items-start space-x-3">
              <MapPin size={18} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Corporate Office</span>
                <span className="text-gray-500 font-normal leading-normal">102 Organic Meadows, Vasant Kunj, New Delhi, India 110070</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Phone Support</span>
                <span className="text-gray-500 font-normal leading-normal">+91 11-4090-8800 (9:30 AM to 6:30 PM, Mon-Sat)</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Email Channels</span>
                <span className="text-gray-500 font-normal leading-normal">support@botanicalsluxury.in / care@botanicalsluxury.in</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Operating Hours</span>
                <span className="text-gray-500 font-normal leading-normal">Monday to Saturday: 09:30 - 18:30 IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="bg-white border border-cream-dark p-8 md:p-12 rounded-sm shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-primary">Submit an Inquiry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  required
                  className="w-full bg-cream-light border border-cream-dark text-xs p-3 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aditi@gmail.com"
                  required
                  className="w-full bg-cream-light border border-cream-dark text-xs p-3 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-cream-light border border-cream-dark text-xs p-3 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Primary Interest</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-cream-light border border-cream-dark text-xs p-3 focus:outline-none focus:border-primary font-medium text-primary"
                >
                  <option value="skin">Skin Care Rituals</option>
                  <option value="hair">Hair Care Vitality</option>
                  <option value="bath">Bath & Body Indulgence</option>
                  <option value="wellness">Fragrance & Wellness</option>
                  <option value="other">Other Inquiry / Feedback</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Your Message *</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your queries or custom requests..."
                required
                className="w-full bg-cream-light border border-cream-dark text-xs p-3 focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full btn-primary text-xs uppercase tracking-wider py-3"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
