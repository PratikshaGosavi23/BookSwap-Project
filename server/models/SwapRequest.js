// models/SwapRequest.js - Swap Request Schema
const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    // Who is requesting the swap
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Who owns the book being requested
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The book being requested
    requestedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    // The book offered in exchange (optional - requester's book)
    offeredBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    // Swap status lifecycle
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Message from requester
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    // Response message from owner
    responseMessage: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters'],
      default: '',
    },
    // When the owner responded
    respondedAt: {
      type: Date,
    },
    // When the swap was completed
    completedAt: {
      type: Date,
    },
    // Meeting point or address for exchange
    meetingPoint: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast queries
swapRequestSchema.index({ requester: 1, status: 1 });
swapRequestSchema.index({ owner: 1, status: 1 });
swapRequestSchema.index({ requestedBook: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
