const express = require('express');
const { assignUserRole, assignProjectToUser } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/assign-role', protect, isAdmin, assignUserRole);
router.post('/assign-project', protect, isAdmin, assignProjectToUser);

module.exports = router;
