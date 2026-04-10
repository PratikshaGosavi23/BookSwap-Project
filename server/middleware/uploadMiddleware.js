// middleware/uploadMiddleware.js
// Now uses Cloudinary instead of local disk storage
const multer = require('multer');
const { bookImageStorage, avatarStorage } = require('../config/cloudinary');

// File filter — same as before
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Book image upload — goes to Cloudinary bookswap/books folder
const uploadBookImage = multer({
  storage:    bookImageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Avatar upload — goes to Cloudinary bookswap/avatars folder
const uploadAvatar = multer({
  storage:    avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Keep default export as book upload for backward compatibility
// (existing routes use: upload.single('image'))
const upload = uploadBookImage;

module.exports = upload;
module.exports.uploadAvatar = uploadAvatar;