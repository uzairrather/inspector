const express = require('express');
const router = express.Router();
const { getUserCompanies } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/for-user', protect, getUserCompanies);

module.exports = router;
