import { Request, Response } from 'express';
import Task from '../models/Task.ts';

export const getTasks = async (req: any, res: Response) => {
  try {
    const filter: any = {};
    if (req.user.role === 'employee') {
      filter.assignedTo = req.user.id;
    }
    const tasks = await Task.find(filter).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Check if employee is updating their own task
    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    if (status === 'completed') {
      task.completionTime = new Date();
    }
    
    if (req.file) {
      task.completionProof = req.file.path;
    }

    await task.save();
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
