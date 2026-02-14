'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/admin/MetricCard';
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
  Legend,
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

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">P.F. Chang's AI Receptionist Dashboard</h1>
        <p className="text-black mt-2">Scottsdale Headquarters - Real-time Analytics</p>

        {/* Time Range Selector */}
        <div className="mt-4 flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === d
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-black border border-black hover:bg-gray-200'
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Calls"
          value={data.overview.totalCalls}
          icon={Phone}
        />
        <MetricCard
          title="Total Chats"
          value={data.overview.totalChats}
          icon={MessageSquare}
        />
        <MetricCard
          title="Appointments"
          value={data.overview.totalAppointments}
          icon={Calendar}
        />
        <MetricCard
          title="Avg Duration"
          value={`${data.overview.averageDuration}s`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Resolution Rate"
          value={data.overview.resolutionRate}
          suffix="%"
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Call Volume */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-black">
          <h2 className="text-lg font-semibold text-black mb-4">Call Volume Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#ef4444"
                strokeWidth={2}
                name="Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Intent Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-black">
          <h2 className="text-lg font-semibold text-black mb-4">Call Intent Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.intents}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.charts.intents.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-black">
        <div className="p-6 border-b-2 border-black">
          <h2 className="text-lg font-semibold text-black">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Caller
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Intent
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black">
              {data.recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    {activity.caller}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {activity.intent || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      activity.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {activity.resolved ? (
                      <span className="text-green-600 font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-black max-w-xs truncate">
                    {activity.summary || 'No summary'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <button
                      onClick={() => setSelectedCall(activity.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      View Transcript
                    </button>
                  </td>
                </tr>
              ))}
              {data.recentActivity.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-black">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-black">
            <div className="p-6 border-b-2 border-black flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Call Transcript</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-black hover:text-red-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const call = data.recentActivity.find(a => a.id === selectedCall);
                if (!call) return <p className="text-black">Call not found</p>;

                return (
                  <div>
                    <div className="mb-4 p-4 bg-gray-100 rounded border border-black">
                      <p className="text-black"><strong>Caller:</strong> {call.caller}</p>
                      <p className="text-black"><strong>Time:</strong> {new Date(call.timestamp).toLocaleString()}</p>
                      <p className="text-black"><strong>Duration:</strong> {call.duration || 0}s</p>
                      <p className="text-black"><strong>Intent:</strong> {call.intent || 'N/A'}</p>
                      <p className="text-black"><strong>Status:</strong> {call.status}</p>
                    </div>

                    {call.transcript ? (
                      <div className="space-y-3">
                        {call.transcript.split('\n').map((line, idx) => {
                          const isUser = line.startsWith('USER:');
                          const isAssistant = line.startsWith('ASSISTANT:');
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded border ${
                                isUser ? 'bg-blue-50 border-blue-300' :
                                isAssistant ? 'bg-green-50 border-green-300' :
                                'bg-gray-50 border-gray-300'
                              }`}
                            >
                              <p className="text-black whitespace-pre-wrap">{line}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-black">No transcript available</p>
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
