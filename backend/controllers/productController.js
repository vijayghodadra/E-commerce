const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 8;
    const page = Number(req.query.page) || 1;

    const query = {};

    // 1. Search filter (Regex)
    if (req.query.search) {
      query.name = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    // 2. Category filter
    if (req.query.category) {
      // Find category by slug
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) {
        query.category = cat._id;
      } else {
        // If category is not found, return empty set
        return res.json({ success: true, products: [], page, pages: 0, count: 0 });
      }
    }

    // 3. Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // 4. Brand filter
    if (req.query.brand) {
      query.brand = { $regex: req.query.brand, $options: 'i' };
    }

    // 5. Rating filter
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    // Only active products
    query.isActive = true;

    // Sorting options
    let sort = {};
    if (req.query.sortBy === 'price_asc') {
      sort = { price: 1 };
    } else if (req.query.sortBy === 'price_desc') {
      sort = { price: -1 };
    } else if (req.query.sortBy === 'rating') {
      sort = { rating: -1 };
    } else if (req.query.sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else {
      sort = { createdAt: -1 }; // Default: Newest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');

    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        title: title || '',
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;

      // Recalculate average rating
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ success: true, message: 'Review added successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending / best seller products
// @route   GET /api/products/trending/list
// @access  Public
const getTrendingProducts = async (req, res) => {
  try {
    // Fetch top-rated and latest products for homepage
    const bestSellers = await Product.find({ isActive: true }).sort({ rating: -1 }).limit(4).populate('category', 'name slug');
    const newArrivals = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).populate('category', 'name slug');

    res.json({
      success: true,
      bestSellers,
      newArrivals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get related products
// @route   GET /api/products/related/:categoryId/:productId
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
      _id: { $ne: req.params.productId },
      isActive: true,
    })
      .limit(4)
      .populate('category', 'name slug');

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProductReview,
  getTrendingProducts,
  getRelatedProducts,
};
