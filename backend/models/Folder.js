const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // ✅ fixed
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ✅ New: AI vector embedding for semantic search
  embedding: {
    type: [Number],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);
