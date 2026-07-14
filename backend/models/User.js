const { DocumentInstance, SupabaseModel } = require('../config/db');
const bcrypt = require('bcryptjs');

class UserInstance extends DocumentInstance {
  async save() {
    if (this.password && !/^\$2[ayb]\$.{50,60}/.test(this.password)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    return await super.save();
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

const User = new SupabaseModel('users', UserInstance);

module.exports = User;
