// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { getRecommendations, getSimilarBooks, generateDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// ── Existing routes (unchanged) ──
router.get('/recommendations',          protect, getRecommendations);
router.get('/similar/:bookId',          getSimilarBooks);
router.post('/generate-description',    protect, generateDescription);

// ── NEW: Hybrid Gemini recommendation route ──
const { getHybridRecommendations } = require('../utils/hybridRecommendation');
const User = require('../models/User');

router.get('/hybrid-recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('interests searchHistory');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const result = await getHybridRecommendations(
      user._id,
      user.interests      || [],
      user.searchHistory  || [],
    );

    res.json({
      success: true,
      recommendations: result.recommendations,
      meta: {
        source:        result.source,
        totalFiltered: result.totalFiltered,
        basedOn:       user.interests,
      },
    });

  } catch (error) {
    console.error('Hybrid recommendation route error:', error.message);
    res.status(500).json({ success: false, message: 'Error getting recommendations.' });
  }
});

module.exports = router;