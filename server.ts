import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import Routes
import authRoutes from './server/routes/authRoutes.ts';
import investorRoutes from './server/routes/investorRoutes.ts';
import employeeRoutes from './server/routes/employeeRoutes.ts';
import attendanceRoutes from './server/routes/attendanceRoutes.ts';
import taskRoutes from './server/routes/taskRoutes.ts';

// Import User Model
import User from './server/models/User.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // app-কে ফাংশনের বাইরে নিয়ে আসা হয়েছে Vercel-এর সুবিধার জন্য

async function setupServer() {
  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Database Connection Logic
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
    try {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(MONGODB_URI);
      console.log('Successfully connected to MongoDB');

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
        { upsert: true, new: true }
      );
      console.log('✅ Admin Account is Ready');
    } catch (err: any) {
      console.error('❌ MongoDB Error:', err.message);
    }
  }

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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
}

// সার্ভার স্টার্ট এবং পোর্ট লিসেনিং
const PORT = process.env.PORT || 3000;

setupServer().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 Local Server: http://localhost:${PORT}`);
    });
  }
});

// Vercel-এর জন্য এক্সপোর্ট
export default app;