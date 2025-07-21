const mongoose = require("mongoose");
const Project = require("../models/Project");
const Folder = require("../models/Folder");
const Asset = require("../models/Asset");
const { generateEmbedding } = require("../utils/embeddingUtils"); // ✅ NEW

function cosineSimilarity(vec1, vec2) {
  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v ** 2, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v ** 2, 0));
  return dot / (mag1 * mag2);
}

exports.search = async (req, res) => {
  try {
    const { query, context, projectId, folderId } = req.query;

    if (!query || !context) {
      return res.status(400).json({ message: "Missing query or context" });
    }

    const queryEmbedding = await generateEmbedding(query);
    let results = [];

    if (context === "project") {
      const allProjects = await Project.find({ company: req.user.company, embedding: { $ne: [] } });
      results = allProjects.map(p => ({
        data: p,
        score: cosineSimilarity(queryEmbedding, p.embedding),
        nameMatch: p.name.toLowerCase().includes(query.toLowerCase())
      })).filter(r => r.score > 0.6 || r.nameMatch);
    }

    if (context === "folder") {
      if (!projectId) return res.status(400).json({ message: "Missing projectId" });

      const filter = { project: new mongoose.Types.ObjectId(projectId), embedding: { $ne: [] } };
      if (folderId) filter.parent = new mongoose.Types.ObjectId(folderId);

      const allFolders = await Folder.find(filter);
      results = allFolders.map(f => ({
        data: f,
        score: cosineSimilarity(queryEmbedding, f.embedding),
        nameMatch: f.name.toLowerCase().includes(query.toLowerCase())
      })).filter(r => r.score > 0.6 || r.nameMatch);
    }

    if (context === "asset") {
      if (!projectId) return res.status(400).json({ message: "Missing projectId" });

      const filter = {
        projectId: new mongoose.Types.ObjectId(projectId),
        embedding: { $ne: [] },
      };
      if (folderId) filter.folderId = new mongoose.Types.ObjectId(folderId);

      const allAssets = await Asset.find(filter);
      results = allAssets.map(a => ({
        data: a,
        score: cosineSimilarity(queryEmbedding, a.embedding),
        nameMatch: a.name.toLowerCase().includes(query.toLowerCase())
      })).filter(r => r.score > 0.6 || r.nameMatch);
    }

    results.sort((a, b) => b.score - a.score);

    res.json({
      type: context,
      results: results.map(r => ({
        ...r.data.toObject(),
        similarityScore: r.score.toFixed(3),
      })),
    });

  } catch (error) {
    console.error("❌ AI Search error:", error);
    res.status(500).json({ message: "Server error during AI search" });
  }
};


