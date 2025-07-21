const Asset = require('../models/Asset');
const Folder = require('../models/Folder');
const mongoose = require("mongoose");
const { generateEmbedding } = require('../utils/embeddingUtils'); // ✅ New import

// ✅ Create a new asset (photo, voice, descriptions, folder or project)
exports.createAsset = async (req, res) => {
  try {
    const {
      name,
      folderId,
      projectId,
      photos,
      textDescription,
      voiceToText,
      voiceNoteUrl,
    } = req.body;

    console.log("📦 Incoming asset body:", {
      name,
      folderId,
      projectId,
      photosLength: photos?.length,
    });

    if (!name || (!folderId && !projectId) || !photos || photos.length === 0) {
      return res.status(400).json({ message: "Missing required asset fields" });
    }

    // ✅ Resolve projectId from folder if not provided
    let resolvedProjectId = projectId;
    if (!resolvedProjectId && folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(400).json({ message: "Folder not found" });
      }
      resolvedProjectId = folder.project;
    }

    // ✅ Create embedding text and generate vector
    const embeddingText = `${name} ${textDescription || ''} ${voiceToText || ''}`;
    const embedding = await generateEmbedding(embeddingText);

    const asset = await Asset.create({
      name,
      folderId: folderId || null,
      projectId: resolvedProjectId || null,
      company: req.user.company,
      photos,
      voiceNoteUrl,
      voiceToText,
      textDescription,
      createdBy: req.user._id,
      embedding, // ✅ Store AI vector
    });

    res.status(201).json({ data: asset });
  } catch (err) {
    console.error("❌ Error creating asset:", err.message);
    res.status(500).json({ message: "Server error creating asset", error: err.message });
  }
};

// ✅ Get all assets in a specific folder
exports.getAssetsByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const assets = await Asset.find({
      folderId,
      company: req.user.company,
    }).populate("createdBy", "fullName");

    res.json({ data: assets });
  } catch (err) {
    console.error("❌ Error fetching assets by folder:", err.message);
    res.status(500).json({ message: "Failed to fetch assets", error: err.message });
  }
};

// ✅ Get all assets in a project root (no folders)
exports.getAssetsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const assets = await Asset.find({
      projectId,
      company: req.user.company,
      folderId: null, // ✅ Only root-level assets
    }).populate("createdBy", "fullName");

    res.json({ data: assets });
  } catch (err) {
    console.error("❌ Failed to fetch project assets:", err.message);
    res.status(500).json({ message: "Failed to fetch project assets" });
  }
};

// ✅ Sync multiple offline assets (PWA support)
exports.syncOfflineAssets = async (req, res) => {
  try {
    const { assets } = req.body;

    if (!Array.isArray(assets)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const results = [];

    for (let item of assets) {
      const embeddingText = `${item.name} ${item.textDescription || ''} ${item.voiceToText || ''}`;
      const embedding = await generateEmbedding(embeddingText);

      const created = await Asset.create({
        ...item,
        company: req.user.company,
        createdBy: req.user._id,
        embedding,
      });

      results.push(created);
    }

    res.status(201).json({ message: "Synced", data: results });
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
    res.status(500).json({ message: "Failed to sync offline assets", error: err.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Asset ID format" });
    }

    const asset = await Asset.findById(req.params.id).populate("createdBy", "fullName");

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.json(asset);
  } catch (err) {
    console.error("❌ Error fetching asset:", err);
    res.status(500).json({ message: "Server error fetching asset" });
  }
};
