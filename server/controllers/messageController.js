// controllers/messageController.js - Chat/Messaging System
const Message = require('../models/Message');
const mongoose = require('mongoose');

// ─── @desc    Send a message
// ─── @route   POST /api/messages
// ─── @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, swapRequestId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required.' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't message yourself." });
    }

    // Participants sorted for consistency
    const participants = [req.user._id, receiverId].sort();

    const message = await Message.create({
      participants,
      sender: req.user._id,
      receiver: receiverId,
      content,
      swapRequest: swapRequestId || null,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Error sending message.' });
  }
};

// ─── @desc    Get conversation between two users
// ─── @route   GET /api/messages/conversation/:userId
// ─── @access  Private
const getConversation = async (req, res) => {
  try {
    const otherId = req.params.userId;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching conversation.' });
  }
};

// ─── @desc    Get all conversations (inbox)
// ─── @route   GET /api/messages/inbox
// ─── @access  Private
const getInbox = async (req, res) => {
  try {
    const myId = req.user._id;

    // Aggregate to get latest message per conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          participants: new mongoose.Types.ObjectId(myId),
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(myId)] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(myId)] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $limit: 20 },
    ]);

    // Populate user info
    const User = require('../models/User');
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('name avatar');
        return { ...conv, user };
      })
    );

    res.json({ success: true, conversations: populated });
  } catch (error) {
    console.error('Inbox error:', error);
    res.status(500).json({ success: false, message: 'Error fetching inbox.' });
  }
};

// ─── @desc    Get unread message count
// ─── @route   GET /api/messages/unread-count
// ─── @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unread count.' });
  }
};

module.exports = { sendMessage, getConversation, getInbox, getUnreadCount };
