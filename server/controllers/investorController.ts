import { Request, Response } from 'express';
import Investor from '../models/Investor.ts';

export const getInvestors = async (req: Request, res: Response) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    res.json(investors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createInvestor = async (req: Request, res: Response) => {
  try {
    const investor = new Investor(req.body);
    await investor.save();
    res.status(201).json(investor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInvestor = async (req: Request, res: Response) => {
  try {
    const investor = await Investor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!investor) return res.status(404).json({ message: 'Investor not found' });
    res.json(investor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInvestor = async (req: Request, res: Response) => {
  try {
    const investor = await Investor.findByIdAndDelete(req.params.id);
    if (!investor) return res.status(404).json({ message: 'Investor not found' });
    res.json({ message: 'Investor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvestmentSummary = async (req: Request, res: Response) => {
  try {
    const summary = await Investor.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$investmentAmount' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(summary[0] || { totalAmount: 0, count: 0 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
