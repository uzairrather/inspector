const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const companyRoutes = require('./routes/companyRoutes');
const searchRoutes = require('./routes/searchRoutes');


dotenv.config();

const app = express();

// Fix: Increase payload limit for large image/audio base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/companies', companyRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
