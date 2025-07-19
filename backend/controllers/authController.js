const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      company: user.company,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ REGISTER USER — Only one correct version
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, company } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Check if company exists (re-use or create)
    let existingCompany = await Company.findOne({ name: company.toUpperCase() });

    if (!existingCompany) {
      existingCompany = await Company.create({
        name: company.toUpperCase(),
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user linked to company
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      company: existingCompany._id,
      roles: ['admin'], // By default they're admin of their own registration
    });

    // 5. (Optional) Set createdBy if this is the first user under company
    if (!existingCompany.createdBy) {
      existingCompany.createdBy = user._id;
      await existingCompany.save();
    }

    // 6. Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, company: existingCompany._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
        company: {
        id: existingCompany._id,
        name: existingCompany.name
    },
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};


// ✅ LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
        company: {
      id: user.company,
      name: (await Company.findById(user.company)).name
    },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
