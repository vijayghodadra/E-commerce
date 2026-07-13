const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProductReview,
  getTrendingProducts,
  getRelatedProducts,
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getProducts);
router.get('/trending/list', getTrendingProducts);
router.get('/related/:categoryId/:productId', getRelatedProducts);
router.get('/:slug', getProductBySlug);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
