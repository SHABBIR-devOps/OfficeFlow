import { Request, Response } from 'express';
import Attendance from '../models/Attendance.ts';
import { format } from 'date-fns';

export const checkIn = async (req: any, res: Response) => {
  try {
    const date = format(new Date(), 'yyyy-MM-dd');
    const existing = await Attendance.findOne({ employee: req.user.id, date });

    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = new Attendance({
      employee: req.user.id,
      date,
      checkIn: new Date(),
      status: 'present'
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req: any, res: Response) => {
  try {
    const date = format(new Date(), 'yyyy-MM-dd');
    const attendance = await Attendance.findOne({ employee: req.user.id, date });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
    await attendance.save();
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAttendance = async (req: any, res: Response) => {
  try {
    const attendance = await Attendance.find({ employee: req.user.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.find().populate('employee', 'name email designation').sort({ date: -1 });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
