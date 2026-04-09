// routes/swapRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  completeSwap,
  cancelSwapRequest,
  getSwapStats,
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',                    protect, createSwapRequest);
router.get('/incoming',             protect, getIncomingRequests);
router.get('/outgoing',             protect, getOutgoingRequests);
router.get('/stats',                protect, getSwapStats);
router.put('/:id/accept',           protect, acceptSwapRequest);
router.put('/:id/reject',           protect, rejectSwapRequest);
router.put('/:id/complete',         protect, completeSwap);
router.put('/:id/cancel',           protect, cancelSwapRequest);

module.exports = router;
