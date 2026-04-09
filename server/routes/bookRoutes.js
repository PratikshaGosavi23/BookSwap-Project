// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const {
  getBooks, getBookById, addBook, updateBook, deleteBook, getMyBooks, trackSearch
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',           getBooks);
router.get('/my-books',   protect, getMyBooks);
router.get('/:id',        getBookById);
router.post('/',          protect, upload.single('image'), addBook);
router.put('/:id',        protect, upload.single('image'), updateBook);
router.delete('/:id',     protect, deleteBook);
router.post('/track-search', protect, trackSearch);

module.exports = router;
