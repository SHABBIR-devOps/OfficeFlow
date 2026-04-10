import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  dueDate: { type: Date },
  completionProof: { type: String }, // File path
  completionTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Task', taskSchema);
