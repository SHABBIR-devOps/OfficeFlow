import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  CalendarCheck, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X,
  Briefcase
} from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet.tsx';
import { cn } from '../../lib/utils.ts';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'employee'] },
    { name: 'Investors', href: '/investors', icon: Briefcase, roles: ['admin', 'employee'] },
    { name: 'Employees', href: '/employees', icon: Users, roles: ['admin'] },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck, roles: ['admin', 'employee'] },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['admin', 'employee'] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role || ''));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">
          OF
        </div>
        <span className="text-xl font-bold tracking-tight">OfficeFlow</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                isActive 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-slate-300" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium truncate">{user?.name}</span>
            <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 w-64 border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
  <div className="flex items-center lg:hidden">
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      {/* সমাধান: asChild সরিয়ে সরাসরি Button ব্যবহার করুন অথবা Button-এর বদলে div/span দিন */}
      <SheetTrigger>
        <div className="p-2 hover:bg-slate-100 rounded-md cursor-pointer transition-colors">
          <Menu className="w-6 h-6 text-slate-600" />
        </div>
      </SheetTrigger>
      
      <SheetContent side="left" className="p-0 w-64 border-none">
        <SidebarContent />
      </SheetContent>
    </Sheet>
    <span className="ml-4 font-bold text-xl text-slate-900">OfficeFlow</span>
  </div>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="hidden sm:block text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
