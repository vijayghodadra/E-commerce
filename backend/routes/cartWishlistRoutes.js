const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getWishlist,
  toggleWishlist,
} = require('../controllers/cartWishlistController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All routes inside are protected

router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.put('/cart/update', updateCartQuantity);
router.delete('/cart/remove/:productId', removeFromCart);

router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

module.exports = router;
