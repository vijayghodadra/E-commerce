const { DocumentInstance, SupabaseModel } = require('../config/db');

class CouponInstance extends DocumentInstance {}

const Coupon = new SupabaseModel('coupons', CouponInstance);

module.exports = Coupon;
