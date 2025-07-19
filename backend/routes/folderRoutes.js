const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createFolder,
  getFoldersByProject,
  getSubFoldersByParent,
  getFolderById,
  getAssetCountForFolderWithSubfolders, // ✅ added
} = require('../controllers/folderController');

const router = express.Router();

// ✅ Create folder
router.post('/', protect, createFolder);

// ✅ Get all top-level folders for a project
router.get('/project/:projectId', protect, getFoldersByProject);

// ✅ Get all subfolders under a parent folder
router.get('/subfolders/:parentId', protect, getSubFoldersByParent);

// ✅ Get a single folder by ID (for showing current folder name)
router.get('/id/:id', protect, getFolderById);

// ✅ New: Get total asset count for a folder + subfolders
router.get('/asset-count/:folderId', protect, getAssetCountForFolderWithSubfolders);

module.exports = router;
