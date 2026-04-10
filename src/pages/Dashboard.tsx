import React, { useEffect, useState } from 'react';
import api from '../services/api.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [investorsRes, employeesRes, tasksRes] = await Promise.all([
          api.get('/investors/summary'),
          api.get('/employees'),
          api.get('/tasks')
        ]);

        setStats({
          totalInvestment: investorsRes.data.totalAmount,
          investorCount: investorsRes.data.count,
          employeeCount: employeesRes.data.length,
          taskCount: tasksRes.data.length,
          completedTasks: tasksRes.data.filter((t: any) => t.status === 'completed').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const cards = [
    { 
      title: 'Total Investment', 
      value: `$${stats?.totalInvestment?.toLocaleString() || 0}`, 
      icon: TrendingUp, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      title: 'Total Investors', 
      value: stats?.investorCount || 0, 
      icon: Briefcase, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    { 
      title: 'Total Employees', 
      value: stats?.employeeCount || 0, 
      icon: Users, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      title: 'Tasks Completed', 
      value: `${stats?.completedTasks || 0}/${stats?.taskCount || 0}`, 
      icon: CheckSquare, 
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ];

  // Mock data for charts
  const chartData = [
    { name: 'Jan', investment: 4000, tasks: 24 },
    { name: 'Feb', investment: 3000, tasks: 13 },
    { name: 'Mar', investment: 2000, tasks: 98 },
    { name: 'Apr', investment: 2780, tasks: 39 },
    { name: 'May', investment: 1890, tasks: 48 },
    { name: 'Jun', investment: 2390, tasks: 38 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome to your office management portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border-none shadow-md shadow-slate-200/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                </div>
                <div className={`${card.bg} p-3 rounded-xl`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-600 flex items-center font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  12%
                </span>
                <span className="text-slate-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Investment Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="investment" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Task Completion Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="tasks" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
