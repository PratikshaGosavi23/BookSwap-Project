// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',                        protect, sendMessage);
router.get('/inbox',                    protect, getInbox);
router.get('/unread-count',             protect, getUnreadCount);
router.get('/conversation/:userId',     protect, getConversation);

module.exports = router;
