const { DocumentInstance, SupabaseModel } = require('../config/db');

class CategoryInstance extends DocumentInstance {}

const Category = new SupabaseModel('categories', CategoryInstance);

module.exports = Category;
