import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipboardList, ChevronDown, ChevronUp, Package, Calendar, CreditCard, MapPin } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import API from '../services/api';

export default function MyOrders() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { token } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!token) {
      showToast('Please login to view your orders', 'error');
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        showToast('Failed to fetch orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [token, navigate]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':  return 'bg-green-100 text-green-800 border border-green-200 font-bold';
      case 'Shipped':    return 'bg-blue-100 text-blue-800 border border-blue-200 font-bold';
      case 'Processing': return 'bg-orange-100 text-orange-800 border border-orange-200 font-bold';
      case 'Cancelled':  return 'bg-red-100 text-red-800 border border-red-200 font-bold';
      default:           return 'bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-cream-dark pb-6 mb-10">
        <h1 className="text-3xl font-serif font-bold text-primary flex items-center">
          <ClipboardList className="mr-3" /> Order History
        </h1>
        <p className="text-gray-500 text-xs mt-2">Track status, shipping estimates, and history of your botanical orders.</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-cream-light rounded-sm border border-cream-dark"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-cream-light/30 border border-cream-dark rounded-sm space-y-4">
          <div className="bg-cream w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
            <ClipboardList size={32} />
          </div>
          <h3 className="font-serif text-lg font-bold text-primary">No orders placed yet</h3>
          <p className="text-xs text-gray-500">You haven't initiated any orders. Explore our catalogs to place your first order.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary text-xs">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-cream-dark rounded-sm overflow-hidden">
              {/* Order Header Summary */}
              <div
                onClick={() => toggleOrderExpand(order._id)}
                className="p-6 bg-cream-light/45 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-cream-light transition-all select-none"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[9px] block">Order Date</span>
                    <span className="font-semibold text-primary flex items-center mt-1">
                      <Calendar size={12} className="mr-1.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[9px] block">Total Amount</span>
                    <span className="font-bold text-wood block mt-1">Rs. {order.totalPrice}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[9px] block">Payment status</span>
                    <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 mt-1 rounded-sm ${
                      order.isPaid ? 'bg-green-100 text-green-800 font-bold' : 'bg-red-100 text-red-800 font-bold'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[9px] block">Order Status</span>
                    <span className={`inline-block text-[10px] uppercase tracking-wider px-2.5 py-1 mt-1 rounded-full ${getStatusStyle(order.orderStatus)}`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-primary font-bold text-xs">
                  <span>View Details</span>
                  {expandedOrderId === order._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Order Expanded Details Panel */}
              {expandedOrderId === order._id && (
                <div className="p-6 border-t border-cream-dark text-xs space-y-6">
                  {/* Order Status Progress Tracker */}
                  {order.orderStatus !== 'Cancelled' && (
                    <div className="bg-cream-light/60 border border-cream-dark rounded-sm p-4">
                      <h4 className="font-serif font-bold text-primary mb-4 text-xs uppercase tracking-wider">Order Progress</h4>
                      <div className="flex items-center justify-between">
                        {STATUS_STEPS.map((step, i) => {
                          const currentIdx = STATUS_STEPS.indexOf(order.orderStatus || 'Pending');
                          const isDone = i <= currentIdx;
                          const isActive = i === currentIdx;
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                  isDone
                                    ? 'bg-[#0F5132] border-[#0F5132] text-white'
                                    : 'bg-white border-gray-200 text-gray-300'
                                } ${isActive ? 'ring-2 ring-[#0F5132]/30 ring-offset-1' : ''}`}>
                                  {isDone ? '✓' : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                  isDone ? 'text-[#0F5132]' : 'text-gray-300'
                                }`}>{step}</span>
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                                  i < currentIdx ? 'bg-[#0F5132]' : 'bg-gray-200'
                                }`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items purchased */}
                  <div>
                    <h4 className="font-serif font-bold text-primary mb-3 flex items-center">
                      <Package size={14} className="mr-1.5 text-secondary" /> Items Packed
                    </h4>
                    <div className="divide-y divide-cream-dark">
                      {order.orderItems.map((item) => (
                        <div key={item.product?._id || item._id} className="py-3.5 flex justify-between items-center">
                          <div>
                            <span className="font-serif font-bold text-primary block">{item.name}</span>
                            <span className="text-gray-400">Qty: {item.qty} × Rs. {item.price}</span>
                          </div>
                          <span className="font-bold text-wood">Rs. {item.qty * item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-dark">
                    {/* Shipping address details */}
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-primary flex items-center">
                        <MapPin size={14} className="mr-1.5 text-secondary" /> Delivery Address
                      </h4>
                      <div className="bg-cream-light/50 p-4 border border-cream-dark rounded-sm space-y-1">
                        <p className="text-gray-700 font-medium">{order.shippingAddress?.street}</p>
                        <p className="text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}</p>
                        <p className="text-gray-400 mt-1">Phone: {order.shippingAddress?.phone}</p>
                      </div>
                    </div>

                    {/* Payment breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-primary flex items-center">
                        <CreditCard size={14} className="mr-1.5 text-secondary" /> Transaction Details
                      </h4>
                      <div className="bg-cream-light/50 p-4 border border-cream-dark rounded-sm space-y-1.5">
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="uppercase font-bold text-primary">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span className="font-semibold text-primary">Rs. {order.itemsPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (GST):</span>
                          <span>Rs. {order.taxPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping Charge:</span>
                          <span>Rs. {order.shippingPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-primary pt-1.5 border-t border-cream-dark">
                          <span>Total Paid:</span>
                          <span className="text-wood">Rs. {order.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
