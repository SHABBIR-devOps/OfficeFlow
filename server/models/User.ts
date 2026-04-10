import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  contactInfo: { type: String },
  salary: { type: Number },
  designation: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Password hashing logic
// Ekhon amra 'next' parameter use korbo na, sudhu async/await use korbo
userSchema.pre('save', async function() {
  // Jodi password change na hoy, tobe kichu korar dorkar nai
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // return; // Auto-advance hobe async function howay
  } catch (error: any) {
    throw error; // Crash na hoye error throw korbe
  }
});

// Password compare method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;