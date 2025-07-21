const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  assignedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  isFavorite: {
    type: Boolean,
    default: false,
  },

  isDone: {
    type: Boolean,
    default: false,
  },

  doneAt: {
    type: Date,
  },

  // ✅ New: AI vector embedding for semantic search
  embedding: {
    type: [Number],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
