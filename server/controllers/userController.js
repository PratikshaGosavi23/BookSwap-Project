// controllers/userController.js - User Profile Management
const User = require('../models/User');
const Book = require('../models/Book');

// ─── @desc    Get public user profile
// ─── @route   GET /api/users/:id
// ─── @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -searchHistory -swapHistory')
      .populate('booksOwned', 'title author image category condition isAvailable');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
};

// ─── @desc    Update current user profile
// ─── @route   PUT /api/users/profile
// ─── @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, interests } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests) {
      updateData.interests = Array.isArray(interests) ? interests : interests.split(',').map((i) => i.trim());
    }

    // Handle avatar upload
    // Handle avatar upload — Cloudinary returns full public URL
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};

// ─── @desc    Update password
// ─── @route   PUT /api/users/password
// ─── @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating password.' });
  }
};

// ─── @desc    Get all users (for discovery)
// ─── @route   GET /api/users
// ─── @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true })
      .select('name avatar bio location booksOwned')
      .populate('booksOwned', 'title')
      .sort('-createdAt')
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
};

module.exports = { getUserProfile, updateProfile, updatePassword, getAllUsers };
