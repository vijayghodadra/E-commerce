const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartWishlistRoutes = require('./routes/cartWishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP so Vite dev server can load cross-origin assets
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart-wishlist', cartWishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Fallback upload static directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// App Health Check
app.get('/api/health', async (req, res) => {
  try {
    const connectDB = require('./config/db');
    if (connectDB.connectionError) {
      return res.status(500).json({
        success: false,
        status: 'Database connection failed (on boot)',
        error: connectDB.connectionError,
        envExists: {
          SUPABASE_CONNECTION_STRING: !!process.env.SUPABASE_CONNECTION_STRING,
          MONGO_URI: !!process.env.MONGO_URI
        }
      });
    }
    const pool = connectDB.getPool ? connectDB.getPool() : null;
    if (!pool) {
      return res.status(500).json({
        success: false,
        status: 'Database pool not initialized',
        envExists: {
          SUPABASE_CONNECTION_STRING: !!process.env.SUPABASE_CONNECTION_STRING,
          MONGO_URI: !!process.env.MONGO_URI
        }
      });
    }
    const client = await pool.connect();
    const dbRes = await client.query('SELECT NOW()');
    client.release();
    return res.json({
      success: true,
      status: 'Connected to Supabase successfully',
      dbTime: dbRes.rows[0].now,
      envExists: {
        SUPABASE_CONNECTION_STRING: !!process.env.SUPABASE_CONNECTION_STRING,
        MONGO_URI: !!process.env.MONGO_URI
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'Database connection failed',
      error: error.message,
      envExists: {
        SUPABASE_CONNECTION_STRING: !!process.env.SUPABASE_CONNECTION_STRING,
        MONGO_URI: !!process.env.MONGO_URI
      }
    });
  }
});

app.get('/', (req, res) => {
  res.send('Botanical Premium E-Commerce API is running...');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
// reload nodemon

