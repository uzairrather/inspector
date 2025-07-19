const mongoose = require('mongoose');

const Company = require('../models/Company'); // Assuming you have this
const Project = require('../models/Project');
const User = require('../models/User');

exports.getUserCompanies = async (req, res) => {
  try {
   const user = await User.findById(req.user._id);
  console.log('✅ User fetched:', user);
console.log('🧠 user.company:', user.company, typeof user.company);
console.log('✅ Is valid ObjectId:', mongoose.Types.ObjectId.isValid(user.company));


    // 1. Get own company if user is admin
   let ownCompany = null;

if (user.roles.includes('admin') && mongoose.Types.ObjectId.isValid(user.company)) {
  ownCompany = await Company.findById(user.company).select('name');
}


    // 2. Get companies from projects assigned to the user
    const projects = await Project.find({
      $or: [
        { assignedInspectorIds: user._id },
      ],
    }).populate('company', 'name');

    // Extract unique companies
    const assignedCompanyMap = new Map();
    for (const project of projects) {
      const company = project.companyId;
      if (company && !assignedCompanyMap.has(company._id.toString())) {
        assignedCompanyMap.set(company._id.toString(), { id: company._id, name: company.name });
      }
    }

    const assignedCompanies = Array.from(assignedCompanyMap.values());

    return res.status(200).json({
      ownCompany: ownCompany ? { id: ownCompany._id, name: ownCompany.name } : null,
      assignedCompanies,
    });
  } catch (err) {
    console.error('Error fetching user companies:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
