// controllers/swapController.js - Book Swap Management
const SwapRequest = require('../models/SwapRequest');
const Book = require('../models/Book');
const User = require('../models/User');

// ─── @desc    Create a swap request
// ─── @route   POST /api/swaps
// ─── @access  Private
const createSwapRequest = async (req, res) => {
  try {
    const { requestedBookId, offeredBookId, message } = req.body;

    const requestedBook = await Book.findById(requestedBookId).populate('owner');
    if (!requestedBook) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    if (!requestedBook.isAvailable) {
      return res.status(400).json({ success: false, message: 'This book is no longer available.' });
    }

    // Can't request your own book
    if (requestedBook.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't request your own book." });
    }

    // Check for duplicate pending request
    const existing = await SwapRequest.findOne({
      requester: req.user._id,
      requestedBook: requestedBookId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this book.' });
    }

    const swap = await SwapRequest.create({
      requester: req.user._id,
      owner: requestedBook.owner._id,
      requestedBook: requestedBookId,
      offeredBook: offeredBookId || null,
      message: message || '',
    });

    // Link to book
    await Book.findByIdAndUpdate(requestedBookId, { $push: { swapRequests: swap._id } });

    const populated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name avatar email')
      .populate('owner', 'name avatar email')
      .populate('requestedBook', 'title author image')
      .populate('offeredBook', 'title author image');

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully! 🔄',
      swap: populated,
    });
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ success: false, message: 'Error creating swap request.' });
  }
};

// ─── @desc    Get all incoming swap requests (for book owner)
// ─── @route   GET /api/swaps/incoming
// ─── @access  Private
const getIncomingRequests = async (req, res) => {
  try {
    const swaps = await SwapRequest.find({ owner: req.user._id })
      .populate('requester', 'name avatar email location')
      .populate('requestedBook', 'title author image category condition')
      .populate('offeredBook', 'title author image category condition')
      .sort('-createdAt');

    res.json({ success: true, swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching incoming requests.' });
  }
};

// ─── @desc    Get all outgoing swap requests (sent by user)
// ─── @route   GET /api/swaps/outgoing
// ─── @access  Private
const getOutgoingRequests = async (req, res) => {
  try {
    const swaps = await SwapRequest.find({ requester: req.user._id })
      .populate('owner', 'name avatar email')
      .populate('requestedBook', 'title author image category condition')
      .populate('offeredBook', 'title author image category condition')
      .sort('-createdAt');

    res.json({ success: true, swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching outgoing requests.' });
  }
};

// ─── @desc    Accept a swap request
// ─── @route   PUT /api/swaps/:id/accept
// ─── @access  Private (book owner)
const acceptSwapRequest = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap request not found.' });
    if (swap.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (swap.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Swap is already ${swap.status}.` });
    }

    swap.status = 'accepted';
    swap.responseMessage = req.body.responseMessage || '';
    swap.meetingPoint = req.body.meetingPoint || '';
    swap.respondedAt = new Date();
    await swap.save();

    // Mark book as unavailable
    await Book.findByIdAndUpdate(swap.requestedBook, { isAvailable: false });

    // Reject all other pending requests for this book
    await SwapRequest.updateMany(
      { requestedBook: swap.requestedBook, status: 'pending', _id: { $ne: swap._id } },
      { status: 'rejected', responseMessage: 'Book has been accepted for another swap.' }
    );

    const populated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name avatar email')
      .populate('owner', 'name avatar email')
      .populate('requestedBook', 'title author image')
      .populate('offeredBook', 'title author image');

    res.json({ success: true, message: 'Swap request accepted! 🎉', swap: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error accepting swap request.' });
  }
};

// ─── @desc    Reject a swap request
// ─── @route   PUT /api/swaps/:id/reject
// ─── @access  Private (book owner)
const rejectSwapRequest = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap request not found.' });
    if (swap.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    swap.status = 'rejected';
    swap.responseMessage = req.body.responseMessage || '';
    swap.respondedAt = new Date();
    await swap.save();

    res.json({ success: true, message: 'Swap request rejected.', swap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting swap request.' });
  }
};

// ─── @desc    Complete a swap
// ─── @route   PUT /api/swaps/:id/complete
// ─── @access  Private
const completeSwap = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap request not found.' });

    const isParty =
      swap.owner.toString() === req.user._id.toString() ||
      swap.requester.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorized.' });

    swap.status = 'completed';
    swap.completedAt = new Date();
    await swap.save();

    // Add to both users' swap history
    await User.findByIdAndUpdate(swap.owner, { $push: { swapHistory: swap._id } });
    await User.findByIdAndUpdate(swap.requester, { $push: { swapHistory: swap._id } });

    res.json({ success: true, message: 'Swap marked as completed! ✅', swap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing swap.' });
  }
};

// ─── @desc    Cancel a swap request (by requester)
// ─── @route   PUT /api/swaps/:id/cancel
// ─── @access  Private
const cancelSwapRequest = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap request not found.' });
    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    swap.status = 'cancelled';
    await swap.save();

    // If it was accepted, re-enable the book
    if (swap.status === 'accepted') {
      await Book.findByIdAndUpdate(swap.requestedBook, { isAvailable: true });
    }

    res.json({ success: true, message: 'Swap request cancelled.', swap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling swap.' });
  }
};

// ─── @desc    Get swap stats for dashboard
// ─── @route   GET /api/swaps/stats
// ─── @access  Private
const getSwapStats = async (req, res) => {
  try {
    const [pending, accepted, completed] = await Promise.all([
      SwapRequest.countDocuments({ $or: [{ owner: req.user._id }, { requester: req.user._id }], status: 'pending' }),
      SwapRequest.countDocuments({ $or: [{ owner: req.user._id }, { requester: req.user._id }], status: 'accepted' }),
      SwapRequest.countDocuments({ $or: [{ owner: req.user._id }, { requester: req.user._id }], status: 'completed' }),
    ]);
    res.json({ success: true, stats: { pending, accepted, completed } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
};

module.exports = {
  createSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  completeSwap,
  cancelSwapRequest,
  getSwapStats,
};
