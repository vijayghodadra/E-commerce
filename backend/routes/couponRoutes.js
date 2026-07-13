const express = require('express');
const router = express.Router();
const { applyCoupon } = require('../controllers/couponController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/apply', protect, applyCoupon);

module.exports = router;
