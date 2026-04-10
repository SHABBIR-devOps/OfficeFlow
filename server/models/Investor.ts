import mongoose from 'mongoose';

const investorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  investmentAmount: { type: Number, required: true },
  investmentDate: { type: Date, default: Date.now },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Investor', investorSchema);
