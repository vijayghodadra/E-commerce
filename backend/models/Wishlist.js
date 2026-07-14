const { DocumentInstance, SupabaseModel } = require('../config/db');

class WishlistInstance extends DocumentInstance {}

const Wishlist = new SupabaseModel('wishlists', WishlistInstance);

module.exports = Wishlist;
