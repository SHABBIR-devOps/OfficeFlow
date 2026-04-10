import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import User from '../models/User.ts';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/emailService.ts';

// 1. Helper: Disposable Email Domains
const DISPOSABLE_DOMAINS = [
  'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'temp-mail.org', 
  'dispostable.com', 'getnada.com', 'sharklasers.com', 'yopmail.com'
];

const isDisposableEmail = (email: string) => {
  if (!email || !email.includes('@')) return true;
  const domain = email.split('@')[1].toLowerCase();
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  if (allowedDomains.includes(domain)) return false;
  return DISPOSABLE_DOMAINS.includes(domain);
};

// 2. Helper: Easy Password Regex (At least 6 characters, 1 letter, 1 number)
const isStrongPassword = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return regex.test(password);
};

// 3. Register Function
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, Email, and Password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (isDisposableEmail(email)) {
      return res.status(400).json({ message: 'Disposable email addresses are not allowed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long and include at least one letter and one number' 
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({ 
      name, 
      email, 
      password, 
      verificationToken,
      isVerified: true // Test korar jonno auto-verify true kora holo
    });
    await user.save();

    // Verification email pathano (Backend error holeo registration jeno na atkoy)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error('Email service error, but user created.');
    }

    res.status(201).json({ 
      message: 'Registration successful! You can now login.' 
    });
  } catch (error: any) {
    next(error); 
  }
};

// 4. Verify Email Function
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error: any) {
    next(error);
  }
};

// 5. Login Function
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// 6. Forgot Password Function
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await sendResetPasswordEmail(email, resetToken);
      res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error: any) {
    next(error);
  }
};

// 7. Reset Password Function
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long and include a letter and a number' 
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error: any) {
    next(error);
  }
};

// 8. Logout Function
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// 9. Get Me Function
export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error: any) {
    next(error);
  }
};