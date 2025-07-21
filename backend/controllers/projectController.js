const Company = require('../models/Company');
const User = require('../models/User');
const Project = require('../models/Project');
const Folder = require('../models/Folder');
const Asset = require('../models/Asset');
const { generateEmbedding } = require('../utils/embeddingUtils'); // ✅ New import

// ✅ Create project
exports.createProject = async (req, res) => {
  try {
    const { name, assignedUsers } = req.body;

    // ✅ Generate embedding from project name
    const embedding = await generateEmbedding(name);

    const project = await Project.create({
      name,
      company: req.user.company,
      createdBy: req.user._id,
      assignedUsers: assignedUsers,
      embedding, // ✅ Save embedding
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Server error during project creation' });
  }
};

// ✅ Recursive asset counter for project (folders + subfolders + root assets)
const countAssetsRecursively = async (projectId) => {
  const folders = await Folder.find({ project: projectId });
  const folderIds = folders.map((f) => f._id);

  const collectSubfolderIds = async (ids) => {
    let all = [];
    for (const id of ids) {
      const children = await Folder.find({ parent: id });
      const childIds = children.map((c) => c._id);
      if (childIds.length) {
        all = all.concat(await collectSubfolderIds(childIds));
        all = all.concat(childIds);
      }
    }
    return all;
  };

  const subfolderIds = await collectSubfolderIds(folderIds);
  const allFolderIds = [...new Set([...folderIds, ...subfolderIds])];

  const folderedCount = await Asset.countDocuments({ folderId: { $in: allFolderIds } });
  const rootCount = await Asset.countDocuments({ projectId, folderId: null });

  return folderedCount + rootCount;
};

// ✅ Get projects for the logged-in user's company
exports.getProjectsForCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company;

    const [projects, user, company] = await Promise.all([
      Project.find({ company: companyId }).populate('createdBy', 'fullName'),
      User.findById(userId),
      Company.findById(companyId),
    ]);

    if (!user || !company) {
      return res.status(404).json({ message: 'User or Company not found' });
    }

    const role = user.roles.includes('admin') ? 'admin' : user.roles[0] || 'viewer';

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const assetCount = await countAssetsRecursively(project._id);
        return {
          ...project.toObject(),
          assetCount,
        };
      })
    );

    res.json({
      projects: projectsWithCounts,
      company: company.name,
      role,
    });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get projects assigned to the current user
exports.getUserProjects = async (req, res) => {
  const projects = await Project.find({
    assignedUsers: req.user._id,
    company: req.user.company,
  });

  res.json(projects);
};

// ✅ Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    await Project.findByIdAndDelete(projectId);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// ✅ Toggle favorite
exports.markProjectFavorite = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    project.isFavorite = !project.isFavorite;
    await project.save();

    res.json({ message: 'Project favorite status updated', project });
  } catch (err) {
    console.error('Error updating favorite status:', err);
    res.status(500).json({ message: 'Server error updating favorite status' });
  }
};

// ✅ Mark as done
exports.markProjectDone = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    project.isDone = true;
    project.doneAt = new Date();
    await project.save();

    res.json({ message: 'Project marked as done', project });
  } catch (err) {
    console.error('Error marking project done:', err);
    res.status(500).json({ message: 'Server error marking done' });
  }
};
