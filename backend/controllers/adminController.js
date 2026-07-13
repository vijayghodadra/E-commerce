const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

// @desc    Get Admin Dashboard Stats & Sales Charts
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue (only paid orders)
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Aggregate monthly/daily sales for charts
    // Group by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesHistory = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
      },
      salesHistory,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =================== MANAGE PRODUCTS =================== //

// @desc    Admin Create Product
// @route   POST /api/admin/products
// @access  Private/Admin
const adminCreateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      discountPrice,
      inventoryCount,
      category,
      brand,
      images,
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const productExists = await Product.findOne({ slug });
    if (productExists) {
      return res.status(400).json({ success: false, message: 'Product with this name already exists' });
    }

    const product = new Product({
      name,
      slug,
      description,
      shortDescription,
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      sku,
      inventoryCount: Number(inventoryCount),
      category,
      brand: brand || 'Pure Botanical',
      images: images || [],
      stockStatus: Number(inventoryCount) > 0 ? 'in_stock' : 'out_of_stock',
      isActive: true,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Update Product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const adminUpdateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      discountPrice,
      inventoryCount,
      category,
      brand,
      images,
      isActive,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      if (name) {
        product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      product.description = description || product.description;
      product.shortDescription = shortDescription !== undefined ? shortDescription : product.shortDescription;
      product.price = price !== undefined ? Number(price) : product.price;
      product.discountPrice = discountPrice !== undefined ? Number(discountPrice) : product.discountPrice;
      product.inventoryCount = inventoryCount !== undefined ? Number(inventoryCount) : product.inventoryCount;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.images = images || product.images;
      product.isActive = isActive !== undefined ? !!isActive : product.isActive;

      product.stockStatus = product.inventoryCount > 0 ? 'in_stock' : 'out_of_stock';

      const updatedProduct = await product.save();
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Delete Product (Soft delete or hard delete, let's do hard delete here or soft toggle)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (product) {
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =================== MANAGE ORDERS =================== //

// @desc    Admin Get All Orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const adminGetOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =================== MANAGE USERS =================== //

// @desc    Admin Get All Customers
// @route   GET /api/admin/users
// @access  Private/Admin
const adminGetUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Block/Unblock User
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const adminBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ success: false, message: 'Cannot block administrative accounts' });
      }
      user.isBlocked = !user.isBlocked;
      const updatedUser = await user.save();
      res.json({
        success: true,
        message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        user: updatedUser,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =================== MANAGE CATEGORIES =================== //

// @desc    Admin Create Category
// @route   POST /api/admin/categories
// @access  Private/Admin
const adminCreateCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, slug, image, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Update Category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const adminUpdateCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      if (name) {
        category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      category.image = image !== undefined ? image : category.image;
      category.description = description !== undefined ? description : category.description;

      const updatedCategory = await category.save();
      res.json({ success: true, category: updatedCategory });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const adminDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (category) {
      res.json({ success: true, message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =================== MANAGE COUPONS =================== //

// @desc    Admin Get All Coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
const adminGetCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Create Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
const adminCreateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxDiscount, expiryDate } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      expiryDate: new Date(expiryDate),
      isActive: true,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Delete Coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
const adminDeleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (coupon) {
      res.json({ success: true, message: 'Coupon deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
