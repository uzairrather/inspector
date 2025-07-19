// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: String,

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  roles: {
    // Admin can assign ['inspector', 'valuator', 'reviewer'] to others
    type: [String],
    enum: ['admin', 'inspector', 'valuator', 'reviewer'],
    default: ['admin'], // Self-admin for own company
  },

  assignedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
