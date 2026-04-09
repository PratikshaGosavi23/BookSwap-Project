// utils/recommendationEngine.js
// Content-Based Filtering Recommendation Engine for BookSwap
// Works without external API — falls back gracefully if OpenAI is configured

const Book = require('../models/Book');

/**
 * Category similarity matrix — defines which categories are related
 * Score 0-1, higher = more similar
 */
const CATEGORY_SIMILARITY = {
  Fiction:          { Fiction: 1, Fantasy: 0.7, 'Science Fiction': 0.6, Mystery: 0.5, Thriller: 0.5, Romance: 0.4 },
  Fantasy:          { Fantasy: 1, Fiction: 0.7, 'Science Fiction': 0.6, Mystery: 0.3 },
  'Science Fiction':{ 'Science Fiction': 1, Fantasy: 0.6, Fiction: 0.5, Technology: 0.5, Science: 0.4 },
  Mystery:          { Mystery: 1, Thriller: 0.8, Fiction: 0.5, Biography: 0.2 },
  Thriller:         { Thriller: 1, Mystery: 0.8, Fiction: 0.5 },
  Romance:          { Romance: 1, Fiction: 0.4 },
  Biography:        { Biography: 1, History: 0.6, 'Non-Fiction': 0.5, 'Self-Help': 0.3 },
  'Self-Help':      { 'Self-Help': 1, Philosophy: 0.5, 'Non-Fiction': 0.5, Biography: 0.3 },
  History:          { History: 1, Biography: 0.6, 'Non-Fiction': 0.5 },
  Science:          { Science: 1, Technology: 0.6, 'Science Fiction': 0.3 },
  Technology:       { Technology: 1, Science: 0.6, 'Science Fiction': 0.3 },
  Philosophy:       { Philosophy: 1, 'Self-Help': 0.5, 'Non-Fiction': 0.4 },
  'Non-Fiction':    { 'Non-Fiction': 1, Biography: 0.5, History: 0.5, 'Self-Help': 0.5 },
  Children:         { Children: 1, Comics: 0.3, Fiction: 0.3 },
  Comics:           { Comics: 1, Children: 0.3, Fantasy: 0.3 },
  Poetry:           { Poetry: 1, Fiction: 0.3, Philosophy: 0.2 },
  Other:            { Other: 1 },
};

/**
 * Calculate similarity score between a user's profile and a book
 */
const calculateScore = (book, userInterests = [], userSearchHistory = []) => {
  let score = 0;

  const allUserCategories = [...new Set([...userInterests, ...userSearchHistory])];

  // Category matching with similarity matrix
  for (const userCat of allUserCategories) {
    const simMap = CATEGORY_SIMILARITY[userCat] || {};
    const sim = simMap[book.category] || 0;
    score += sim * 2; // Weight category matches heavily
  }

  // Boost score for popular books (view count)
  score += Math.min(book.viewCount / 50, 0.5);

  // Slightly boost newer books
  const daysSinceAdded = (Date.now() - new Date(book.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceAdded < 7) score += 0.3;
  else if (daysSinceAdded < 30) score += 0.1;

  return score;
};

/**
 * Main recommendation function
 * @param {string} userId - The user ID
 * @param {Array} userInterests - Categories user is interested in
 * @param {Array} userSearchHistory - Categories user has searched
 * @param {string} excludeOwnerId - Exclude books owned by this user
 * @param {number} limit - Max recommendations to return
 */
const getContentBasedRecommendations = async (userId, userInterests = [], userSearchHistory = [], limit = 8) => {
  try {
    // Get available books (not owned by user)
    const books = await Book.find({
      isAvailable: true,
      owner: { $ne: userId },
    })
      .populate('owner', 'name avatar')
      .lean();

    if (!books.length) return [];

    // If user has no history, return most popular books
    if (!userInterests.length && !userSearchHistory.length) {
      return books
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, limit)
        .map((book) => ({ ...book, recommendationScore: 0, reason: 'Popular on BookSwap' }));
    }

    // Score each book
    const scored = books.map((book) => {
      const score = calculateScore(book, userInterests, userSearchHistory);

      // Build reason string
      const allUserCats = [...new Set([...userInterests, ...userSearchHistory])];
      const matchedCat = allUserCats.find((cat) => {
        const sim = (CATEGORY_SIMILARITY[cat] || {})[book.category] || 0;
        return sim > 0.3;
      });

      let reason = 'Popular on BookSwap';
      if (matchedCat) reason = `Because you like ${matchedCat}`;
      if (book.viewCount > 10) reason += ' · Trending';

      return { ...book, recommendationScore: score, reason };
    });

    // Sort by score descending, randomise ties
    scored.sort((a, b) => {
      if (Math.abs(b.recommendationScore - a.recommendationScore) < 0.1) {
        return Math.random() - 0.5;
      }
      return b.recommendationScore - a.recommendationScore;
    });

    return scored.slice(0, limit);
  } catch (error) {
    console.error('Recommendation engine error:', error);
    return [];
  }
};

/**
 * OpenAI-enhanced recommendations (if API key configured)
 * Uses GPT to generate personalized book descriptions
 */
const getAIEnhancedRecommendations = async (user, recommendations) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    return recommendations; // Fallback to content-based
  }

  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const bookTitles = recommendations.slice(0, 5).map((b) => `"${b.title}" by ${b.author}`).join(', ');
    const userProfile = `Interests: ${user.interests.join(', ') || 'general reading'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a book recommendation assistant for BookSwap, a peer-to-peer book exchange platform. Generate concise, enthusiastic one-line reasons (max 10 words) why a user would love each book.',
        },
        {
          role: 'user',
          content: `User profile: ${userProfile}\n\nBooks: ${bookTitles}\n\nFor each book, give a short personalized reason in JSON: {"reasons": ["reason1", "reason2", ...]}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}');
    const aiReasons = parsed.reasons || [];

    return recommendations.map((book, idx) => ({
      ...book,
      reason: aiReasons[idx] || book.reason,
      aiEnhanced: !!aiReasons[idx],
    }));
  } catch (err) {
    console.error('OpenAI enhancement failed, using content-based:', err.message);
    return recommendations; // Graceful fallback
  }
};

module.exports = { getContentBasedRecommendations, getAIEnhancedRecommendations };
