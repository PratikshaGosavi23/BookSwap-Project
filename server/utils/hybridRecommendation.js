// server/utils/hybridRecommendation.js

console.log("KEY:", process.env.GEMINI_API_KEY);

const axios = require("axios");
const Book = require("../models/Book");

// ─── STEP A: Rule-based filter ───────────────────────────────
const getRuleBasedBooks = async (userId, userInterests = [], userSearchHistory = []) => {
  try {
    const allPreferences = [...new Set([...userInterests, ...userSearchHistory])];

    let filteredBooks = [];

    if (allPreferences.length > 0) {
      filteredBooks = await Book.find({
        isAvailable: true,
        owner: { $ne: userId },
        category: { $in: allPreferences },
      })
        .populate("owner", "name")
        .limit(15)
        .lean();
    }

    if (filteredBooks.length < 5) {
      const existingIds = filteredBooks.map((b) => b._id.toString());

      const popularBooks = await Book.find({
        isAvailable: true,
        owner: { $ne: userId },
        _id: { $nin: existingIds },
      })
        .populate("owner", "name")
        .sort({ viewCount: -1 })
        .limit(15 - filteredBooks.length)
        .lean();

      filteredBooks = [...filteredBooks, ...popularBooks];
    }

    if (filteredBooks.length === 0) {
      filteredBooks = await Book.find({
        isAvailable: true,
        owner: { $ne: userId },
      })
        .populate("owner", "name")
        .limit(15)
        .lean();
    }

    return filteredBooks;
  } catch (error) {
    console.error("Rule-based filter error:", error.message);
    return [];
  }
};

// ─── STEP B: Gemini via REST (FINAL FIX) ─────────────────────
const getGeminiRankedRecommendations = async (books, userInterests = []) => {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No Gemini key — using rule-based only");
    return books.slice(0, 6).map((b) => ({
      title: b.title,
      author: b.author,
      reason: `Matches your interest in ${b.category}`,
      geminiEnhanced: false,
    }));
  }

  try {
    const bookList = books
      .map((b, i) => `${i + 1}. "${b.title}" by ${b.author} [${b.category}]`)
      .join("\n");

    const userPrefs =
      userInterests.length > 0
        ? userInterests.join(", ")
        : "general reading";

    const prompt = `
User interests: ${userPrefs}

Books:
${bookList}

Return ONLY valid JSON array:
[
  {"title": "Book Title", "author": "Author Name", "reason": "Why recommended"}
]
`;

    console.log("🔥 Calling Gemini via REST...");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("RAW GEMINI RESPONSE:", text);

    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON PARSE ERROR:", cleaned);
      throw err;
    }

    return parsed.map((item) => ({
      title: item.title || "Unknown",
      author: item.author || "Unknown",
      reason: item.reason || "Recommended for you",
      geminiEnhanced: true,
    }));
  } catch (error) {
    console.error("❌ GEMINI REST ERROR:", error.response?.data || error.message);

    return books.slice(0, 6).map((b) => ({
      title: b.title,
      author: b.author,
      reason: `Matches your interest in ${b.category}`,
      geminiEnhanced: false,
    }));
  }
};

// ─── MAIN FUNCTION ───────────────────────────────────────────
const getHybridRecommendations = async (
  userId,
  userInterests,
  userSearchHistory
) => {
  const filteredBooks = await getRuleBasedBooks(
    userId,
    userInterests,
    userSearchHistory
  );

  if (filteredBooks.length === 0) {
    return { recommendations: [], source: "empty" };
  }

  const recommendations = await getGeminiRankedRecommendations(
    filteredBooks,
    userInterests
  );

  return {
    recommendations,
    source: recommendations[0]?.geminiEnhanced ? "gemini" : "rule-based",
    totalFiltered: filteredBooks.length,
  };
};

module.exports = { getHybridRecommendations };