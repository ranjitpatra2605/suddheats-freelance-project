const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shuddheats/products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ width: 1000, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/upload/product-image — any logged-in user (admin only accesses admin page)
router.post('/product-image', protect, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Cloudinary returns the full URL in req.file.path
    const url = req.file.path;
    res.json({ success: true, url, filename: req.file.filename });
});

module.exports = router;
