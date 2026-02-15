'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageSquare, Calendar, TrendingUp, LogOut, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  overview: {
    totalCalls: number;
    totalChats: number;
    totalAppointments: number;
    resolutionRate: string;
    averageDuration: number;
  };
  charts: {
    daily: Array<{ date: string; calls: number }>;
    intents: Array<{ name: string; value: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    caller: string;
    intent: string | null;
    status: string;
    timestamp: string;
    resolved: boolean;
    duration?: number;
    summary?: string;
    transcript?: string;
  }>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  async function fetchDashboardData() {
    try {
      const response = await fetch(`/api/admin/metrics?days=${days}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
      </div>
    );
  }

  const metrics = [
    { title: 'Total Calls', value: data.overview.totalCalls, icon: Phone, color: 'red' },
    { title: 'Total Chats', value: data.overview.totalChats, icon: MessageSquare, color: 'blue' },
    { title: 'Appointments', value: data.overview.totalAppointments, icon: Calendar, color: 'green' },
    { title: 'Avg Duration', value: `${data.overview.averageDuration}s`, icon: Clock, color: 'orange' },
    { title: 'Resolution', value: `${data.overview.resolutionRate}%`, icon: TrendingUp, color: 'purple' },
  ];

  const colorMap: Record<string, { bgLight: string; bgDark: string; iconLight: string; iconDark: string }> = {
    red: { bgLight: 'bg-red-50', bgDark: 'dark:bg-red-500/10', iconLight: 'text-red-600', iconDark: 'dark:text-red-500' },
    blue: { bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-500/10', iconLight: 'text-blue-600', iconDark: 'dark:text-blue-500' },
    green: { bgLight: 'bg-green-50', bgDark: 'dark:bg-green-500/10', iconLight: 'text-green-600', iconDark: 'dark:text-green-500' },
    orange: { bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-500/10', iconLight: 'text-orange-600', iconDark: 'dark:text-orange-500' },
    purple: { bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-500/10', iconLight: 'text-purple-600', iconDark: 'dark:text-purple-500' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/[0.06] px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">P.F. Chang&apos;s Scottsdale HQ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-white/[0.05] rounded-lg p-1">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    days === d
                      ? 'bg-red-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((m) => {
            const colors = colorMap[m.color];
            return (
              <div key={m.title} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{m.title}</p>
                  <div className={`w-8 h-8 ${colors.bgLight} ${colors.bgDark} rounded-lg flex items-center justify-center`}>
                    <m.icon className={`w-4 h-4 ${colors.iconLight} ${colors.iconDark}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Call Volume Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.charts.daily}>
                <CartesianGrid stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Line type="monotone" dataKey="calls" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Intent Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.charts.intents}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.charts.intents.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {data.charts.intents.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  {['Caller', 'Type', 'Intent', 'Status', 'Time', 'Resolved', 'Summary', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {data.recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{activity.caller}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{activity.intent || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        activity.status === 'COMPLETED' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' :
                        activity.status === 'IN_PROGRESS' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {activity.resolved ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {activity.summary || 'No summary'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedCall(activity.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {data.recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.1] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.06] flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Call Transcript</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-xl transition-colors"
              >
                x
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-70px)]">
              {(() => {
                const call = data.recentActivity.find(a => a.id === selectedCall);
                if (!call) return <p className="text-gray-500 dark:text-gray-400">Call not found</p>;

                return (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.06]">
                      <p className="text-sm"><span className="text-gray-400">Caller:</span> <span className="text-gray-900 dark:text-white">{call.caller}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Time:</span> <span className="text-gray-900 dark:text-white">{new Date(call.timestamp).toLocaleString()}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Duration:</span> <span className="text-gray-900 dark:text-white">{call.duration || 0}s</span></p>
                      <p className="text-sm"><span className="text-gray-400">Intent:</span> <span className="text-gray-900 dark:text-white">{call.intent || 'N/A'}</span></p>
                    </div>

                    {call.transcript ? (
                      <div className="space-y-2">
                        {call.transcript.split('\n').map((line, idx) => {
                          const isUser = line.startsWith('USER:');
                          const isAssistant = line.startsWith('ASSISTANT:');
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl text-sm ${
                                isUser ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/10' :
                                isAssistant ? 'bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/10' :
                                'bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]'
                              }`}
                            >
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{line}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-sm">No transcript available</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
