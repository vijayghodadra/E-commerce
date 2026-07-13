import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ShieldCheck, Truck, Package, RotateCcw } from 'lucide-react';
import API from '../services/api';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Estimate delivery date: 5 days from now
  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      {/* Circle check */}
      <div className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center mx-auto shadow-md border-2 border-primary">
        <Check size={40} className="stroke-[3]" />
      </div>

      <div className="space-y-3">
        <span className="text-secondary font-bold text-xs uppercase tracking-widest block">Thank you for your order</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">Your Ritual Has Begun</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          We have received your payment. Your organic formulations are being prepared at our farms and will be shipped shortly.
        </p>
      </div>

      {/* Invoice Details card */}
      <div className="bg-cream-light border border-cream-dark p-6 rounded-sm text-left max-w-lg mx-auto space-y-4">
        <h3 className="font-serif text-sm font-bold text-primary pb-2 border-b border-cream-dark flex items-center justify-between">
          <span>Invoice Summary</span>
          <span className="text-[10px] text-gray-400 font-sans">ORDER ID: {orderId}</span>
        </h3>
        
        {loading ? (
          <div className="h-20 animate-pulse bg-white rounded-sm"></div>
        ) : order ? (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-semibold text-primary">
              <span>Paid Amount</span>
              <span className="text-wood">Rs. {order.totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment Mode</span>
              <span className="uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping Address</span>
              <span className="text-right max-w-xs">{order.shippingAddress?.street}, {order.shippingAddress?.city}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Order metadata could not be fetched.</p>
        )}
      </div>

      {/* Delivery Schedule & Policies Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto pt-6">
        <div className="space-y-2 text-center">
          <Truck size={24} className="text-primary mx-auto" />
          <h4 className="font-serif text-xs font-bold text-primary">Estimated Delivery</h4>
          <p className="text-[10px] text-gray-500 leading-normal">{getDeliveryEstimate()}</p>
        </div>
        <div className="space-y-2 text-center">
          <Package size={24} className="text-primary mx-auto" />
          <h4 className="font-serif text-xs font-bold text-primary">Fresh Batches</h4>
          <p className="text-[10px] text-gray-500 leading-normal">Bottled fresh within 24 hours of dispatch.</p>
        </div>
        <div className="space-y-2 text-center">
          <RotateCcw size={24} className="text-primary mx-auto" />
          <h4 className="font-serif text-xs font-bold text-primary">Easy Returns</h4>
          <p className="text-[10px] text-gray-500 leading-normal">7-day simple replacement for transit damage.</p>
        </div>
      </div>

      <div className="pt-6 flex justify-center space-x-4">
        <Link to="/my-orders" className="btn-primary text-xs">
          Track My Orders
        </Link>
        <Link to="/shop" className="btn-outline text-xs">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
