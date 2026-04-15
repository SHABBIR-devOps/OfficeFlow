import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// --- FIXED: Removed .ts extensions ---
import authRoutes from './server/routes/authRoutes';
import investorRoutes from './server/routes/investorRoutes';
import employeeRoutes from './server/routes/employeeRoutes';
import attendanceRoutes from './server/routes/attendanceRoutes';
import taskRoutes from './server/routes/taskRoutes';
import User from './server/models/User';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Database Connection (Outside setupServer to ensure it hits before requests)
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      // Admin Setup
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
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

async function setupServer() {
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'OfficeFlow API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/investors', investorRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Vite / Production Logic
  if (process.env.NODE_ENV === 'production') {
    // --- FIXED: Path for Vercel ---
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
}

// Start Server
setupServer();

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Local Server: http://localhost:${PORT}`);
  });
}

export default app;