// controllers/bookController.js - Book Management
const Book = require('../models/Book');
const User = require('../models/User');
const path = require('path');

// ─── @desc    Get all books with search + filter + pagination
// ─── @route   GET /api/books
// ─── @access  Public
const getBooks = async (req, res) => {
  try {
    const { search, category, condition, page = 1, limit = 12, sort = '-createdAt', owner } = req.query;

    const query = { isAvailable: true };

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'All') query.category = category;
    if (condition && condition !== 'All') query.condition = condition;
    if (owner) query.owner = owner;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('owner', 'name avatar location')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Book.countDocuments(query),
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ success: false, message: 'Error fetching books.' });
  }
};

// ─── @desc    Get single book by ID
// ─── @route   GET /api/books/:id
// ─── @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('owner', 'name avatar bio location email')
      .populate({ path: 'swapRequests', select: 'requester status', populate: { path: 'requester', select: 'name' } });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    // Increment view count
    book.viewCount += 1;
    await book.save({ validateBeforeSave: false });

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching book.' });
  }
};

// ─── @desc    Add a new book
// ─── @route   POST /api/books
// ─── @access  Private
const addBook = async (req, res) => {
  try {
    const { title, author, description, category, condition, language, isbn, publishedYear, tags } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const book = await Book.create({
      title,
      author,
      description,
      category,
      condition,
      language: language || 'English',
      isbn,
      publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      image: imageUrl,
      owner: req.user._id,
    });

    // Add book to user's owned list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { booksOwned: book._id },
      $addToSet: { interests: category }, // Track interests from categories
    });

    const populatedBook = await Book.findById(book._id).populate('owner', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Book listed successfully! 🎉',
      book: populatedBook,
    });
  } catch (error) {
    console.error('Add book error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Error adding book.' });
  }
};

// ─── @desc    Update book
// ─── @route   PUT /api/books/:id
// ─── @access  Private (owner only)
const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this book.' });
    }

    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name avatar');

    res.json({ success: true, message: 'Book updated successfully.', book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating book.' });
  }
};

// ─── @desc    Delete book
// ─── @route   DELETE /api/books/:id
// ─── @access  Private (owner only)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this book.' });
    }

    await Book.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { booksOwned: book._id } });

    res.json({ success: true, message: 'Book removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting book.' });
  }
};

// ─── @desc    Get books by current user
// ─── @route   GET /api/books/my-books
// ─── @access  Private
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your books.' });
  }
};

// ─── @desc    Track search for recommendations
// ─── @route   POST /api/books/track-search
// ─── @access  Private
const trackSearch = async (req, res) => {
  try {
    const { category } = req.body;
    if (category) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { searchHistory: category },
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking search.' });
  }
};

module.exports = { getBooks, getBookById, addBook, updateBook, deleteBook, getMyBooks, trackSearch };
