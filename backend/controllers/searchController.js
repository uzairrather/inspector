const mongoose = require("mongoose");
const Project = require("../models/Project");
const Folder = require("../models/Folder");
const Asset = require("../models/Asset");

exports.search = async (req, res) => {
  try {
    const { query, context, projectId, folderId } = req.query;

    if (!query || !context) {
      return res.status(400).json({ message: "Missing query or context" });
    }

    const regex = new RegExp(query, "i"); // case-insensitive match
    let results = [];

    console.log(`🔍 Searching "${query}" in context "${context}"`);
    console.log(`📦 projectId: ${projectId}, folderId: ${folderId}`);

    if (context === "project") {
      results = await Project.find({ name: regex, company: req.user.company });
      console.log("✅ Matching projects:", results);
      return res.json({ type: "project", results });
    }

    if (context === "folder") {
      if (!projectId)
        return res.status(400).json({ message: "Missing projectId" });

      const queryObj = {
        name: regex,
        project: new mongoose.Types.ObjectId(projectId),
      };

      // Optional: limit to current folder
      if (folderId) {
        queryObj.parent = new mongoose.Types.ObjectId(folderId);
      }

      console.log("📁 Folder query:", queryObj);

      results = await Folder.find(queryObj);

      console.log("✅ Matching folders:", results);
      return res.json({ type: "folder", results });
    }

    if (context === "asset") {
      if (!projectId)
        return res.status(400).json({ message: "Missing projectId" });

      const baseFilter = {
        name: regex,
        project: new mongoose.Types.ObjectId(projectId),
      };

      // 🔍 Try folder-scoped first
      if (folderId) {
        const folderFilter = {
          ...baseFilter,
          folder: new mongoose.Types.ObjectId(folderId),
        };
        console.log("🎯 Trying asset filter in folder:", folderFilter);
        results = await Asset.find(folderFilter);
      }

      // 🔁 Fallback to project-level asset search if nothing found
      if (!results.length) {
        console.log("🔁 No folder result. Trying full project asset search...");
        results = await Asset.find(baseFilter);
      }

      console.log("✅ Matching assets:", results);
      return res.json({ type: "asset", results });
    }

    return res.status(400).json({ message: "Invalid context value" });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};
