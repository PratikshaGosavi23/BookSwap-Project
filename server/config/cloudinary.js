// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine for book cover images
const bookImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'bookswap/books',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 600, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Storage engine for user avatar images
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'bookswap/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }],
  },
});

module.exports = { cloudinary, bookImageStorage, avatarStorage };