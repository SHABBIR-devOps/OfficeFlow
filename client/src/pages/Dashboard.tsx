import React, { useEffect, useState } from 'react';
import api from '../services/api.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  TrendingUp,
  ArrowUpRight
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
          totalInvestment: investorsRes.data?.totalAmount || 0,
          investorCount: investorsRes.data?.count || 0,
          employeeCount: employeesRes.data?.length || 0,
          taskCount: tasksRes.data?.length || 0,
          completedTasks: tasksRes.data?.filter((t: any) => t.status === 'completed')?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-slate-500 font-medium">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  );

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

  const chartData = [
    { name: 'Jan', investment: 4000, tasks: 24 },
    { name: 'Feb', investment: 3000, tasks: 13 },
    { name: 'Mar', investment: 2000, tasks: 98 },
    { name: 'Apr', investment: 2780, tasks: 39 },
    { name: 'May', investment: 1890, tasks: 48 },
    { name: 'Jun', investment: 2390, tasks: 38 },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome to your office management portal.</p>
      </header>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">{card.value}</h3>
                </div>
                <div className={`${card.bg} p-3 rounded-xl shadow-inner`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs">
                <span className="text-emerald-600 flex items-center font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  12.5%
                </span>
                <span className="text-slate-400 ml-2 italic">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">Investment Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Aspect ratio and fixed container ensuring no -1 height errors */}
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="investment" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">Task Completion Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="tasks" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;