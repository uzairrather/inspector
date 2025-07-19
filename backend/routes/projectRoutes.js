const express = require('express');
const {
  createProject,
  getUserProjects,
  getProjectsForCompany,
  deleteProject,
  markProjectFavorite,
  markProjectDone,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Get all projects for logged-in user
router.get('/', protect, getUserProjects);

// ✅ Create new project (with assigned users)
router.post('/', protect, createProject);

// ✅ Mark project as favorite
router.patch('/:projectId/favorite', protect, markProjectFavorite);

// ✅ Mark project as done
router.patch('/:projectId/done', protect, markProjectDone);

// ✅ Delete project
router.delete('/:projectId', protect, deleteProject);

// ✅ Get all projects for a specific company (admin use)
router.get('/company/:companyId', protect, getProjectsForCompany);

// ✅ Get a single project by ID – KEEP THIS LAST
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await require('../models/Project').findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
