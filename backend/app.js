const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const companyRoutes = require('./routes/companyRoutes');
const searchRoutes = require('./routes/searchRoutes');

dotenv.config();

const app = express();

// ✅ Fix 1: Trust proxy (important for cookies on Vercel)
app.set('trust proxy', 1);

// ✅ Fix 2: Proper CORS config
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'https://inspector-chi.vercel.app'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/companies', companyRoutes);
app.use('/api/search', searchRoutes);

// ✅ Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
