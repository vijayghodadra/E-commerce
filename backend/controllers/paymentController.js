const Razorpay = require('razorpay');
const stripe = require('stripe');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize gateways safely
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('dummy')) {
    return null;
  }
  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (error) {
    console.error('Error initializing Razorpay:', error.message);
    return null;
  }
};

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('dummy')) {
    return null;
  }
  try {
    return stripe(secretKey);
  } catch (error) {
    console.error('Error initializing Stripe:', error.message);
    return null;
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const amountInPaisa = Math.round(order.totalPrice * 100);

    const razorpay = getRazorpayInstance();

    // Simulation check
    if (!razorpay) {
      console.log(`[SIMULATION] Creating simulated Razorpay order for local testing. Amount: Rs. ${order.totalPrice}`);
      const simulatedRazorpayOrderId = `order_simulated_${crypto.randomBytes(6).toString('hex')}`;
      
      // Save simulated order ID in order result
      order.paymentResult = { id: simulatedRazorpayOrderId, status: 'created' };
      await order.save();

      return res.json({
        success: true,
        simulated: true,
        key_id: 'rzp_test_dummykey123456',
        amount: amountInPaisa,
        currency: 'INR',
        id: simulatedRazorpayOrderId,
      });
    }

    // Real SDK integration
    const options = {
      amount: amountInPaisa,
      currency: 'INR',
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.paymentResult = { id: razorpayOrder.id, status: 'created' };
    await order.save();

    res.json({
      success: true,
      simulated: false,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      id: razorpayOrder.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const razorpay = getRazorpayInstance();

    // Simulation verification
    if (!razorpay || razorpay_order_id.startsWith('order_simulated_')) {
      console.log(`[SIMULATION] Verifying simulated Razorpay payment...`);
      
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id || `pay_simulated_${crypto.randomBytes(6).toString('hex')}`,
        status: 'paid',
        update_time: new Date().toISOString(),
        signature: 'simulated_valid_signature',
      };
      
      await order.save();
      return res.json({ success: true, message: 'Simulated payment verified successfully' });
    }

    // Real verification
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'paid',
        update_time: new Date().toISOString(),
        signature: razorpay_signature,
      };

      await order.save();
      res.json({ success: true, message: 'Payment verified and captured successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/intent
// @access  Private
const createStripeIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const stripeInstance = getStripeInstance();
    const amountInPaisa = Math.round(order.totalPrice * 100);

    // Simulation check
    if (!stripeInstance) {
      console.log(`[SIMULATION] Creating simulated Stripe client secret...`);
      return res.json({
        success: true,
        simulated: true,
        clientSecret: `seti_simulated_${crypto.randomBytes(12).toString('hex')}_secret_${crypto.randomBytes(12).toString('hex')}`,
      });
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInPaisa,
      currency: 'inr',
      metadata: { integration_check: 'accept_a_payment', order_id: order._id.toString() },
    });

    res.json({
      success: true,
      simulated: false,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Stripe Payment
// @route   POST /api/payments/stripe/verify
// @access  Private
const verifyStripePayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const stripeInstance = getStripeInstance();

    if (!stripeInstance || paymentIntentId.startsWith('seti_simulated_')) {
      console.log(`[SIMULATION] Verifying simulated Stripe payment...`);
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentIntentId,
        status: 'paid',
        update_time: new Date().toISOString(),
      };
      await order.save();
      return res.json({ success: true, message: 'Simulated Stripe payment verified' });
    }

    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
      };
      await order.save();
      res.json({ success: true, message: 'Stripe payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: `Payment failed with status: ${paymentIntent.status}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  verifyStripePayment,
};
