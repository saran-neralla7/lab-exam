const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const assetRoutes = require('./routes/assetRoutes');
const templateRoutes = require('./routes/templateRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const documentRoutes = require('./routes/documentRoutes');
const User = require('./models/User');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/documents', documentRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'password123',
        role: 'Admin',
      });
      console.log('Default Admin created: admin / password123');
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
};

connectDB().then(async () => {
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
