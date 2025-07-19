const express = require('express');
const { uploadPhoto, uploadVoice } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Photo upload route
router.post('/photo', protect, uploadPhoto);

// ✅ Voice/audio upload route
router.post('/voice', protect, uploadVoice);

module.exports = router;
