const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      addressId,
    } = req.body;

    // 1. Resolve orderItems from req.body or Cart
    let itemsToProcess = orderItems;
    if (!itemsToProcess || itemsToProcess.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'No order items' });
      }
      itemsToProcess = cart.items.map(item => ({
        product: item.product,
        qty: item.qty,
      }));
    }

    // 2. Resolve shippingAddress from req.body or addressId
    let finalShippingAddress = shippingAddress;
    if (!finalShippingAddress && addressId) {
      const Address = require('../models/Address');
      const addressDoc = await Address.findOne({ _id: addressId, user: req.user._id });
      if (!addressDoc) {
        return res.status(400).json({ success: false, message: 'Shipping address not found' });
      }
      finalShippingAddress = {
        streetAddress: addressDoc.streetAddress,
        city: addressDoc.city,
        state: addressDoc.state,
        pinCode: addressDoc.pinCode,
        country: addressDoc.country || 'India',
        phone: addressDoc.phone,
      };
    }

    if (!finalShippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Normalize paymentMethod casing for DB schema vs. controller check
    const normalizedPaymentMethod = (paymentMethod || 'cod').toLowerCase();
    const dbPaymentMethod = normalizedPaymentMethod === 'cod' ? 'COD' : (normalizedPaymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe');

    // 3. Verify items and calculate subtotal
    let itemsPrice = 0;
    const verifiedItems = [];

    for (const item of itemsToProcess) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found` });
      }

      // Check stock
      if (product.inventoryCount < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.inventoryCount}`,
        });
      }

      // Calculate price (using discountPrice if exists and greater than 0, else regular price)
      const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      itemsPrice += activePrice * item.qty;

      verifiedItems.push({
        name: product.name,
        qty: item.qty,
        image: product.images[0] || '',
        price: activePrice,
        product: product._id,
      });
    }

    // 4. Coupon discount verification
    let discountPrice = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date(coupon.expiryDate) >= new Date() && itemsPrice >= coupon.minPurchase) {
        if (coupon.discountType === 'percentage') {
          discountPrice = (itemsPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount > 0 && discountPrice > coupon.maxDiscount) {
            discountPrice = coupon.maxDiscount;
          }
        } else {
          discountPrice = coupon.discountValue;
        }
      }
    }

    // 5. Tax and Shipping calculations
    // 18% GST included or added? Let's say it is added (18% tax of subtotal after discount)
    const taxPrice = Number((0.18 * (itemsPrice - discountPrice)).toFixed(2));
    
    // Free shipping on orders above Rs. 999 after discount, else Rs. 99 shipping fee
    const shippingPrice = (itemsPrice - discountPrice) >= 999 ? 0 : 99;

    const totalPrice = Number((itemsPrice - discountPrice + taxPrice + shippingPrice).toFixed(2));

    // 6. Create Order
    const order = new Order({
      user: req.user._id,
      orderItems: verifiedItems,
      shippingAddress: finalShippingAddress,
      paymentMethod: dbPaymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      isPaid: false, // will update to true upon successful online payment or upon delivery for COD
    });

    const createdOrder = await order.save();

    // 7. Decrement inventory counts
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventoryCount: -item.qty },
      });
      // Update stock status if count reaches 0
      const updatedProd = await Product.findById(item.product);
      if (updatedProd.inventoryCount <= 0) {
        updatedProd.stockStatus = 'out_of_stock';
        await updatedProd.save();
      }
    }

    // 8. Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // 9. Handle Payment logic
    if (normalizedPaymentMethod === 'cod') {
      res.status(201).json({ success: true, order: createdOrder });
      return;
    }

    // Return created order details for online gateways to start checkout
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: User can only see their own orders, Admins can see any order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order to paid (for internal simulation if needed)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        // If COD, mark as paid upon delivery
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }
      const updatedOrder = await order.save();
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  updateOrderStatus,
};
