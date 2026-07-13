const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      default: 0.0,
    },
    sku: {
      type: String,
      required: [true, 'Please enter SKU code'],
      unique: true,
      trim: true,
    },
    inventoryCount: {
      type: Number,
      required: [true, 'Please enter product inventory count'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    brand: {
      type: String,
      default: 'Pure Botanical',
      trim: true,
    },
    rating: {
      type: Number,
      default: 0.0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    stockStatus: {
      type: String,
      required: true,
      enum: ['in_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
