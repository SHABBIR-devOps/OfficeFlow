import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes and models - relative to server/
import authRoutes from './routes/authRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5000);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));  // uploads at root

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      // Create admin if not exists
      const adminEmail = 'admin@officeflow.com';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      await User.findOneAndUpdate(
        { email: adminEmail },
        {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          designation: 'System Administrator',
          status: 'active',
          isVerified: true
        },
        { upsert: true }
      );
    })
    .catch(err => console.error('❌ MongoDB Error:', err));
}

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'OfficeFlow API Server running' }));

app.use('/api/auth', authRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);

// Production: Serve client build from server/dist
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Client (dev): http://localhost:5173`);
});

export default app;

