// models/Book.js - Book Schema
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science Fiction',
        'Fantasy',
        'Mystery',
        'Thriller',
        'Romance',
        'Biography',
        'Self-Help',
        'History',
        'Science',
        'Technology',
        'Philosophy',
        'Children',
        'Comics',
        'Poetry',
        'Other',
      ],
    },
    condition: {
      type: String,
      required: [true, 'Book condition is required'],
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    },
    image: {
      type: String,
      default: '', // URL or file path
    },
    language: {
      type: String,
      default: 'English',
    },
    isbn: {
      type: String,
      default: '',
    },
    publishedYear: {
      type: Number,
    },
    // Owner of the book
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Availability status
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Tags for AI content-based filtering
    tags: {
      type: [String],
      default: [],
    },
    // How many times this book was viewed/requested
    viewCount: {
      type: Number,
      default: 0,
    },
    // Swap requests for this book
    swapRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SwapRequest',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Text index for search ────────────────────────────────────
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ owner: 1 });
bookSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Book', bookSchema);
