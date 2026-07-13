const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', addOrderItems);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);

module.exports = router;
