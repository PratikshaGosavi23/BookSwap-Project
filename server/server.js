// ============================================================
// BookSwap - Main Server Entry Point
// ============================================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const bookRoutes    = require('./routes/bookRoutes');
const swapRoutes    = require('./routes/swapRoutes');
const userRoutes    = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const aiRoutes      = require('./routes/aiRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/books',    bookRoutes);
app.use('/api/swaps',    swapRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai',       aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'BookSwap API is running 🚀', timestamp: new Date() });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Database + Server Start ──────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 BookSwap Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
