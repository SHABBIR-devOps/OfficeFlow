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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { toast } from 'sonner';
import {
  LogIn,
  LogOut,
  Clock,
  User,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../components/ui/badge.tsx';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  employee?: {
    _id: string;
    name: string;
  };
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  const fetchAttendance = async () => {
    try {
      const endpoint =
        user?.role === 'admin' ? '/api/attendance/all' : '/api/attendance/my';

      const response = await api.get<AttendanceRecord[]>(endpoint);
      setAttendance(response.data);

      const today = format(new Date(), 'yyyy-MM-dd');
      const record = response.data.find((r) => {
        const rDate = r.date;
        const isMyRecord = user?.role === 'admin' ? r.employee?._id === user.id : true;
        return rDate === today && isMyRecord;
      });

      setTodayRecord(record || null);
    } catch (error) {
      console.error('Attendance fetch error:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAttendance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCheckIn = async () => {
    try {
      await api.post('/api/attendance/check-in');
      toast.success('Checked in successfully');
      fetchAttendance();
    } catch (error: any) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    console.log('Frontend checkout call, user:', user);

    try {
      const response = await api.post('/api/attendance/check-out');
      console.log('Checkout response:', response.data);
      toast.success('Checked out successfully');
      fetchAttendance();
    } catch (error: any) {
      console.error('Checkout error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500">Track daily check-in and check-out records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-indigo-200" />
                <span className="text-sm font-medium text-indigo-100 uppercase tracking-wider">
                  Current Time
                </span>
              </div>
              <h2 className="text-4xl font-bold">{format(new Date(), 'hh:mm a')}</h2>
              <p className="text-indigo-100 mt-1">{format(new Date(), 'EEEE, MMMM dd')}</p>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 gap-3"
                  disabled={!!todayRecord?.checkIn}
                  onClick={handleCheckIn}
                >
                  <LogIn className="w-6 h-6" />
                  {todayRecord?.checkIn ? 'Already Checked In' : 'Check In'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-14 text-lg border-slate-200 hover:bg-slate-50 gap-3"
                  disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                  onClick={handleCheckOut}
                >
                  <LogOut className="w-6 h-6 text-red-500" />
                  {todayRecord?.checkOut ? 'Already Checked Out' : 'Check Out'}
                </Button>
              </div>

              {todayRecord && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Check In:</span>
                    <span className="font-medium text-slate-900">
                      {todayRecord.checkIn
                        ? format(new Date(todayRecord.checkIn), 'hh:mm a')
                        : '--:--'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Check Out:</span>
                    <span className="font-medium text-slate-900">
                      {todayRecord.checkOut
                        ? format(new Date(todayRecord.checkOut), 'hh:mm a')
                        : '--:--'}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <Badge
                      className={
                        todayRecord.checkOut
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }
                    >
                      {todayRecord.checkOut ? 'Shift Completed' : 'Currently Working'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                {user?.role === 'admin' ? 'All Attendance History' : 'My Attendance History'}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    {user?.role === 'admin' && <TableHead>Employee</TableHead>}
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={user?.role === 'admin' ? 5 : 4}
                        className="text-center py-8 text-slate-500"
                      >
                        Loading records...
                      </TableCell>
                    </TableRow>
                  ) : attendance.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={user?.role === 'admin' ? 5 : 4}
                        className="text-center py-8 text-slate-500"
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((record) => (
                      <TableRow key={record._id}>
                        {user?.role === 'admin' && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">
                                {record.employee?.name || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        <TableCell className="text-slate-600">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </TableCell>

                        <TableCell className="font-medium text-emerald-600">
                          {record.checkIn
                            ? format(new Date(record.checkIn), 'hh:mm a')
                            : '--:--'}
                        </TableCell>

                        <TableCell className="font-medium text-red-500">
                          {record.checkOut
                            ? format(new Date(record.checkOut), 'hh:mm a')
                            : '--:--'}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;