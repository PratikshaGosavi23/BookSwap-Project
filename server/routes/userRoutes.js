// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, updatePassword, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',                protect, getAllUsers);
router.get('/:id',             getUserProfile);
router.put('/profile',         protect, upload.single('avatar'), updateProfile);
router.put('/password',        protect, updatePassword);

module.exports = router;
