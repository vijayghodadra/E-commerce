const { DocumentInstance, SupabaseModel } = require('../config/db');

class ProductInstance extends DocumentInstance {}

const Product = new SupabaseModel('products', ProductInstance);

module.exports = Product;
