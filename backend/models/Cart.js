const { DocumentInstance, SupabaseModel } = require('../config/db');

class CartInstance extends DocumentInstance {}

const Cart = new SupabaseModel('carts', CartInstance);

module.exports = Cart;
