const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminGetUsers,
  adminBlockUser,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetCoupons,
  adminCreateCoupon,
  adminDeleteCoupon,
} = require('../controllers/adminController');
const { updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(admin); // Ensure all routes require administrative rights

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.post('/products', adminCreateProduct);
router.route('/products/:id')
  .put(adminUpdateProduct)
  .delete(adminDeleteProduct);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', adminGetUsers);
router.put('/users/:id/block', adminBlockUser);

// Categories
router.post('/categories', adminCreateCategory);
router.route('/categories/:id')
  .put(adminUpdateCategory)
  .delete(adminDeleteCategory);

// Coupons
router.route('/coupons')
  .get(adminGetCoupons)
  .post(adminCreateCoupon);
router.delete('/coupons/:id', adminDeleteCoupon);

module.exports = router;
