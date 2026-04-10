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

async function startServer() {
  const app = express();
  const PORT = 3000;

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

      // --- ADMIN SEEDING LOGIC (FORCE UPDATE) ---
      const adminEmail = 'admin@officeflow.com';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);

      // adminCount check na kore directly upsert korchi jate password update hoy
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
      console.log('✅ Admin Account is Ready (admin@officeflow.com / adminpassword123)');
      // ------------------------------------------

    } catch (err: any) {
      console.error('❌ MongoDB Error:', err.message);
    }
  } else {
    console.error('MONGODB_URI missing or invalid in .env file!');
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

  // Vite development mode logic
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error(err));