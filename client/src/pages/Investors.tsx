import React, { useEffect, useState } from 'react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog.tsx';
import { Label } from '../components/ui/label.tsx';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface Investor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  investmentAmount: number;
  investmentDate: string;
  notes?: string;
}

interface InvestorFormData {
  name: string;
  phone: string;
  email: string;
  investmentAmount: string;
  notes: string;
}

const Investors: React.FC = () => {
  const { user } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    phone: '',
    email: '',
    investmentAmount: '',
    notes: ''
  });

  const fetchInvestors = async () => {
    try {
      const response = await api.get<Investor[]>('/api/investors');
      setInvestors(response.data);
    } catch (error) {
      console.error('Fetch investors error:', error);
      toast.error('Failed to fetch investors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleOpenDialog = (investor: Investor | null = null) => {
    if (investor) {
      setEditingInvestor(investor);
      setFormData({
        name: investor.name,
        phone: investor.phone,
        email: investor.email,
        investmentAmount: investor.investmentAmount.toString(),
        notes: investor.notes || ''
      });
    } else {
      setEditingInvestor(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        investmentAmount: '',
        notes: ''
      });
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (editingInvestor) {
        await api.put(`/api/investors/${editingInvestor._id}`, formData);
        toast.success('Investor updated successfully');
      } else {
        await api.post('/api/investors', formData);
        toast.success('Investor added successfully');
      }

      setIsDialogOpen(false);
      fetchInvestors();
    } catch (error: any) {
      console.error('Investor save error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this investor?')) return;

    try {
      await api.delete(`/api/investors/${id}`);
      toast.success('Investor deleted successfully');
      fetchInvestors();
    } catch (error: any) {
      console.error('Delete investor error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete investor');
    }
  };

  const filteredInvestors = investors.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvestment = investors.reduce((sum, i) => sum + i.investmentAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investors</h1>
          <p className="text-slate-500">Manage your office investors and their investments.</p>
        </div>

        {user?.role === 'admin' && (
          <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Investor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search investors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Loading investors...
                    </TableCell>
                  </TableRow>
                ) : filteredInvestors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No investors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvestors.map((investor) => (
                    <TableRow key={investor._id}>
                      <TableCell className="font-medium">{investor.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{investor.email}</div>
                          <div className="text-slate-400">{investor.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-indigo-600">
                        ${investor.investmentAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {format(new Date(investor.investmentDate), 'MMM dd, yyyy')}
                      </TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(investor)}>
                              <Edit2 className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(investor._id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-medium">Investment Summary</span>
            </div>
            <div className="space-y-1">
              <span className="text-indigo-100 text-sm">Total Investment</span>
              <h2 className="text-3xl font-bold">${totalInvestment.toLocaleString()}</h2>
            </div>
            <div className="mt-6 pt-6 border-t border-indigo-500 flex justify-between items-center">
              <span className="text-indigo-100 text-sm">Total Investors</span>
              <span className="font-bold text-xl">{investors.length}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingInvestor ? 'Edit Investor' : 'Add New Investor'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.investmentAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, investmentAmount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                {editingInvestor ? 'Update Investor' : 'Save Investor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investors;