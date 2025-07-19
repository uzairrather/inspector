const User = require('../models/User');
const Project = require('../models/Project');

exports.assignUserRole = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) return res.status(400).json({ message: 'Missing data' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Only allow if both belong to same company
  if (user.company !== req.user.company)
    return res.status(403).json({ message: 'Cross-company access denied' });

  if (!user.roles.includes(role)) {
    user.roles.push(role);
    await user.save();
  }

  res.json({ message: `Assigned role ${role} to ${user.email}`, user });
};

exports.assignProjectToUser = async (req, res) => {
  const { email, projectId } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.company !== req.user.company)
    return res.status(403).json({ message: 'Cross-company access denied' });

  if (!user.assignedProjects.includes(projectId)) {
    user.assignedProjects.push(projectId);
    await user.save();
  }

  res.json({ message: `Project assigned to ${user.email}` });
};
