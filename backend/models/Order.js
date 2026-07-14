const { DocumentInstance, SupabaseModel } = require('../config/db');

class OrderInstance extends DocumentInstance {}

const Order = new SupabaseModel('orders', OrderInstance);

module.exports = Order;
