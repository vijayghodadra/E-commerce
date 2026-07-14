const { DocumentInstance, SupabaseModel } = require('../config/db');

class AddressInstance extends DocumentInstance {}

const Address = new SupabaseModel('addresses', AddressInstance);

module.exports = Address;
