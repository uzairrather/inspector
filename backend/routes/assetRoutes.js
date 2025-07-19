const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAsset,
  getAssetsByFolder,
  getAssetsByProject,
  syncOfflineAssets,
  getAssetById
} = require('../controllers/assetController');

const router = express.Router();

router.post('/', protect, createAsset);
router.get('/folder/:folderId', protect, getAssetsByFolder);
router.get('/project/:projectId', protect, getAssetsByProject); // ✅ Add this
router.post('/sync', protect, syncOfflineAssets);
router.get('/id/:id', protect, getAssetById);

module.exports = router;
