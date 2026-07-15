const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const connectDB = require('./backend/config/db');
const Product = require('./backend/models/Product');

async function test() {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("DB Connected. Fetching products...");

    const products = await Product.find({});
    console.log("Fetched products count:", products.length);
    if (products.length > 0) {
      console.log("First product details:", products[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error("TEST FAILED:", err.stack);
    process.exit(1);
  }
}

test();
