const Address = require('../models/Address');

// @desc    Get all user addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
const createAddress = async (req, res) => {
  try {
    const { streetAddress, city, state, pinCode, country, phone, isDefault } = req.body;

    // If isDefault is true, set all other user addresses to isDefault = false
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      streetAddress,
      city,
      state,
      pinCode,
      country: country || 'India',
      phone,
      isDefault: !!isDefault,
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const { streetAddress, city, state, pinCode, country, phone, isDefault } = req.body;
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (address) {
      if (isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
      }

      address.streetAddress = streetAddress || address.streetAddress;
      address.city = city || address.city;
      address.state = state || address.state;
      address.pinCode = pinCode || address.pinCode;
      address.country = country || address.country;
      address.phone = phone || address.phone;
      address.isDefault = isDefault !== undefined ? !!isDefault : address.isDefault;

      const updatedAddress = await address.save();
      res.json({ success: true, address: updatedAddress });
    } else {
      res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (address) {
      res.json({ success: true, message: 'Address deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
