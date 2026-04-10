import React, { useEffect, useState } from 'react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { toast } from 'sonner';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Upload,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });

  const fetchData = async () => {
    try {
      const [tasksRes, employeesRes] = await Promise.all([
        api.get('/tasks'),
        user?.role === 'admin' ? api.get('/employees') : Promise.resolve({ data: [] })
      ]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      toast.success('Task assigned successfully');
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusUpdate = async (taskId: string, status: string) => {
    if (status === 'completed' && user?.role === 'employee') {
      setSelectedTask(tasks.find(t => t._id === taskId));
      setIsProofDialogOpen(true);
      return;
    }

    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      toast.success('Task status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return;

    const formData = new FormData();
    formData.append('status', 'completed');
    formData.append('proof', proofFile);

    try {
      await api.put(`/tasks/${selectedTask._id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Task completed with proof!');
      setIsProofDialogOpen(false);
      setProofFile(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to upload proof');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Completed</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">In Progress</Badge>;
      default: return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-slate-500">Assign and track office tasks efficiently.</p>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Assign New Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No tasks assigned yet.</div>
        ) : (
          tasks.map((task) => (
            <Card key={task._id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  {getStatusBadge(task.status)}
                  {user?.role === 'admin' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDeleteTask(task._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl mt-3 leading-tight">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-slate-600 text-sm line-clamp-3">{task.description}</p>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>Assigned to: <span className="font-medium text-slate-900">{task.assignedTo?.name}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Due Date: <span className="font-medium text-slate-900">{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No deadline'}</span></span>
                  </div>
                </div>

                {task.completionProof && (
                  <div className="pt-2">
                    <a 
                      href={`/${task.completionProof}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Completion Proof
                    </a>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4">
                <div className="w-full flex gap-2">
                  {task.status !== 'completed' && (
                    <>
                      {task.status === 'pending' && (
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700" 
                          size="sm"
                          onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                          size="sm"
                          onClick={() => handleStatusUpdate(task._id, 'completed')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Done
                        </Button>
                      )}
                    </>
                  )}
                  {task.status === 'completed' && (
                    <div className="w-full text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed on {format(new Date(task.completionTime), 'MMM dd')}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Prepare Monthly Report"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description"
                className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select 
                  onValueChange={(val) => setFormData({...formData, assignedTo: val})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Proof Upload Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Upload Completion Proof</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadProof} className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                accept="image/*,.pdf"
              />
              <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-900">
                {proofFile ? proofFile.name : 'Click to upload proof'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Images or PDF (Max 5MB)</p>
            </div>
            
            <DialogFooter>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!proofFile}>
                Complete Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
