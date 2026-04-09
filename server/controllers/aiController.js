// controllers/aiController.js - AI Recommendation System
const User = require('../models/User');
const { getContentBasedRecommendations, getAIEnhancedRecommendations } = require('../utils/recommendationEngine');

// ─── @desc    Get AI book recommendations for logged-in user
// ─── @route   GET /api/ai/recommendations
// ─── @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('interests searchHistory');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const limit = parseInt(req.query.limit) || 8;

    // Step 1: Content-based filtering
    let recommendations = await getContentBasedRecommendations(
      user._id,
      user.interests,
      user.searchHistory,
      limit
    );

    // Step 2: Try to enhance with OpenAI (if configured)
    recommendations = await getAIEnhancedRecommendations(user, recommendations);

    res.json({
      success: true,
      recommendations,
      meta: {
        total: recommendations.length,
        basedOn: {
          interests: user.interests,
          searchHistory: user.searchHistory,
        },
        aiEnhanced: recommendations.some((r) => r.aiEnhanced),
      },
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ success: false, message: 'Error generating recommendations.' });
  }
};

// ─── @desc    Get similar books to a specific book
// ─── @route   GET /api/ai/similar/:bookId
// ─── @access  Public
const getSimilarBooks = async (req, res) => {
  try {
    const Book = require('../models/Book');
    const sourceBook = await Book.findById(req.params.bookId);
    if (!sourceBook) return res.status(404).json({ success: false, message: 'Book not found.' });

    // Use the source book's category as the "interest"
    const similar = await getContentBasedRecommendations(
      sourceBook.owner.toString(),
      [sourceBook.category],
      [],
      6
    );

    // Filter out the source book itself
    const filtered = similar.filter((b) => b._id.toString() !== req.params.bookId);

    res.json({ success: true, similarBooks: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching similar books.' });
  }
};

// ─── @desc    Generate a book description using AI (if OpenAI configured)
// ─── @route   POST /api/ai/generate-description
// ─── @access  Private
const generateDescription = async (req, res) => {
  try {
    const { title, author, category } = req.body;
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required.' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your')) {
      return res.json({
        success: true,
        description: `A ${category || ''} book by ${author}. Add your personal review or notes about this book here!`,
        aiGenerated: false,
      });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a book description writer. Write concise, engaging book descriptions in 2-3 sentences for a book exchange platform.',
        },
        {
          role: 'user',
          content: `Write a brief description for "${title}" by ${author} (category: ${category || 'General'}).`,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const description = completion.choices[0]?.message?.content?.trim() || '';

    res.json({ success: true, description, aiGenerated: true });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({ success: false, message: 'Error generating description.' });
  }
};

module.exports = { getRecommendations, getSimilarBooks, generateDescription };
