const mongoose = require("mongoose");
const Folder = require("../models/Folder");
const Asset = require("../models/Asset"); // ✅ required for asset counting

exports.createFolder = async (req, res) => {
  try {
    console.log("📥 Incoming folder body:", req.body);

    const { name, project, company, parent = null } = req.body;

    if (!name || !project || !company) {
      return res
        .status(400)
        .json({ message: "Name, project, and company are required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const folder = await Folder.create({
      name,
      project: new mongoose.Types.ObjectId(project),
      company: new mongoose.Types.ObjectId(company),
      parent: parent ? new mongoose.Types.ObjectId(parent) : null,
      createdBy: req.user._id,
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error("❌ Error creating folder:", error);
    res.status(500).json({ message: "Server error creating folder" });
  }
};

// ✅ Get all root folders for a project (parent: null)
exports.getFoldersByProject = async (req, res) => {
  try {
    const folders = await Folder.find({
      project: req.params.projectId,
      parent: null,
    })
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    res.json(folders);
  } catch (error) {
    console.error("❌ Error fetching folders:", error);
    res.status(500).json({ message: "Server error fetching folders" });
  }
};

// ✅ Get subfolders under a given folder (by parent ID)
exports.getSubFoldersByParent = async (req, res) => {
  try {
    const parent = req.params.parentId;

    const subfolders = await Folder.find({
      parent: new mongoose.Types.ObjectId(parent),
    })
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    res.json(subfolders);
  } catch (error) {
    console.error("❌ Error fetching subfolders:", error);
    res.status(500).json({ message: "Server error fetching subfolders" });
  }
};

// ✅ Get a single folder by ID (for showing folder name in UI)
exports.getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).populate(
      "createdBy",
      "fullName"
    );

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.json(folder);
  } catch (error) {
    console.error("❌ Error fetching folder by ID:", error);
    res.status(500).json({ message: "Server error fetching folder" });
  }
};

// ✅ Get total asset count for folder + subfolders
exports.getAssetCountForFolderWithSubfolders = async (req, res) => {
  try {
    const { folderId } = req.params;

    const rootFolderObjectId = new mongoose.Types.ObjectId(folderId);

    const collectSubfolderIds = async (parentId) => {
      const children = await Folder.find({ parent: parentId });
      const childIds = children.map((c) => c._id);
      let all = [...childIds];

      for (const childId of childIds) {
        const nested = await collectSubfolderIds(childId);
        all = all.concat(nested);
      }

      return all;
    };

    const subfolderIds = await collectSubfolderIds(rootFolderObjectId);
    const allFolderIds = [rootFolderObjectId, ...subfolderIds];

    // console.log("📁 Folder ID:", rootFolderObjectId.toString());
    // console.log("📂 Subfolder IDs:", subfolderIds.map((id) => id.toString()));
    // console.log("📦 All folder IDs for count:", allFolderIds.map((id) => id.toString()));

    const assetCount = await Asset.countDocuments({
      folderId: { $in: allFolderIds },
      company: req.user.company,
    });

    console.log("✅ Total assets found:", assetCount);

    res.json({ count: assetCount });
  } catch (error) {
    console.error("❌ Error getting asset count for folder:", error);
    res.status(500).json({ message: "Server error" });
  }
};
