// models/User.js - User Schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: '', // URL or path to profile image
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    // Tracks user interests for AI recommendations
    interests: {
      type: [String],
      default: [],
    },
    // Categories the user has searched or interacted with
    searchHistory: {
      type: [String],
      default: [],
    },
    // Books this user has added (references)
    booksOwned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    // Swap history (completed swaps)
    swapHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SwapRequest',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before saving ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare passwords ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: total books count ───────────────────────────────
userSchema.virtual('totalBooks').get(function () {
  return this.booksOwned.length;
});

module.exports = mongoose.model('User', userSchema);
