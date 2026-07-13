const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  verifyStripePayment,
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

router.post('/stripe/intent', createStripeIntent);
router.post('/stripe/verify', verifyStripePayment);

module.exports = router;
