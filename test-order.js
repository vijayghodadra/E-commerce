const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const connectDB = require('./backend/config/db');
const User = require('./backend/models/User');
const Product = require('./backend/models/Product');
const Order = require('./backend/models/Order');
const Cart = require('./backend/models/Cart');
const Address = require('./backend/models/Address');

async function test() {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("DB Connected.");

    // Find a customer user
    const user = await User.findOne({ role: 'customer' });
    if (!user) {
      console.error("No customer user found in DB!");
      process.exit(1);
    }
    console.log("Found User:", user.email, "ID:", user._id);

    // Find a product
    const product = await Product.findOne({});
    if (!product) {
      console.error("No product found in DB!");
      process.exit(1);
    }
    console.log("Found Product:", product.name, "ID:", product._id);

    // Make sure user has an address
    let address = await Address.findOne({ user: user._id });
    if (!address) {
      console.log("Creating a mock address...");
      address = await Address.create({
        user: user._id,
        streetAddress: "123 Green Valley Road",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "400001",
        phone: "9876543210",
        isDefault: true
      });
    }
    console.log("Using Address ID:", address._id);

    // Setup user cart
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      console.log("Creating user cart...");
      cart = await Cart.create({ user: user._id, items: [] });
    }
    cart.items = [{ product: product._id, qty: 1 }];
    await cart.save();
    console.log("Cart setup with 1 product.");

    // Simulate addOrderItems req/res
    const req = {
      user: user,
      body: {
        addressId: address._id,
        paymentMethod: 'cod',
        couponCode: null
      }
    };

    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        console.log("RESPONSE JSON (Code:", this.statusCode, "):", JSON.stringify(data, null, 2));
      }
    };

    console.log("Invoking addOrderItems...");
    const { addOrderItems } = require('./backend/controllers/orderController');
    await addOrderItems(req, res);
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("TEST FAILED:", err.stack);
    process.exit(1);
  }
}

test();
