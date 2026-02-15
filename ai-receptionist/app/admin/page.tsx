'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone, MessageSquare, Calendar, LogOut, Clock, DollarSign,
  ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight,
  Users, BarChart3, Percent,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
} from 'recharts';

interface HeroMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
}

interface OperationalMetrics {
  totalCalls: number;
  totalChats: number;
  totalAppointments: number;
  resolutionRate: number;
  averageCallDuration: number;
  averageTimeToOrder: number;
  callsWithOrders: number;
  callsWithoutOrders: number;
}

interface DashboardData {
  heroMetrics: HeroMetrics;
  operationalMetrics: OperationalMetrics;
  charts: {
    revenueTimeline: Array<{ date: string; revenue: number; orders: number; calls: number }>;
    orderTypeDistribution: Array<{ name: string; value: number; revenue: number }>;
    intentDistribution: Array<{ name: string; value: number }>;
    hourlyActivity: Array<{ hour: number; calls: number; orders: number }>;
    conversionFunnel: {
      totalCalls: number;
      completedCalls: number;
      callsWithIntent: number;
      callsWithOrders: number;
      completedOrders: number;
    };
  };
  topCallers: Array<{
    id: string;
    name: string;
    company: string | null;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    caller: string;
    company: string | null;
    type: string;
    status: string;
    total: number;
    guestCount: number | null;
    createdAt: string;
  }>;
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
    orderTotal?: number | null;
  }>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      {Math.abs(value)}%
    </span>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'orders' | 'activity'>('orders');
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  async function fetchDashboardData() {
    setLoading(true);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
      </div>
    );
  }

  const { heroMetrics, operationalMetrics, charts } = data;

  const heroCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(heroMetrics.totalRevenue),
      change: heroMetrics.revenueChange,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: heroMetrics.totalOrders,
      change: heroMetrics.ordersChange,
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(heroMetrics.averageOrderValue),
      change: heroMetrics.aovChange,
      icon: BarChart3,
      color: 'purple',
    },
    {
      title: 'Conversion Rate',
      value: `${heroMetrics.conversionRate}%`,
      change: heroMetrics.conversionChange,
      icon: Percent,
      color: 'orange',
    },
  ];

  const heroColorMap: Record<string, { bg: string; icon: string }> = {
    green: { bg: 'bg-green-50 dark:bg-green-500/10', icon: 'text-green-600 dark:text-green-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', icon: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', icon: 'text-orange-600 dark:text-orange-400' },
  };

  const funnel = charts.conversionFunnel;
  const funnelData = [
    { name: 'Total Calls', value: funnel.totalCalls, fill: '#3b82f6' },
    { name: 'Completed', value: funnel.completedCalls, fill: '#6366f1' },
    { name: 'With Intent', value: funnel.callsWithIntent, fill: '#8b5cf6' },
    { name: 'With Orders', value: funnel.callsWithOrders, fill: '#f97316' },
    { name: 'Order Completed', value: funnel.completedOrders, fill: '#22c55e' },
  ];

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    CONFIRMED: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    IN_PROGRESS: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
    DELIVERED: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
    COMPLETED: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
    CANCELLED: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
    REFUNDED: 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/[0.06] px-8 py-4 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
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

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* Hero Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroCards.map((card) => {
            const colors = heroColorMap[card.color];
            return (
              <div key={card.title} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <TrendBadge value={card.change} />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.title}</p>
              </div>
            );
          })}
        </div>

        {/* Operational Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Calls', value: operationalMetrics.totalCalls, icon: Phone },
            { label: 'Chats', value: operationalMetrics.totalChats, icon: MessageSquare },
            { label: 'Appointments', value: operationalMetrics.totalAppointments, icon: Calendar },
            { label: 'Avg Duration', value: `${operationalMetrics.averageCallDuration}s`, icon: Clock },
            { label: 'Resolution', value: `${operationalMetrics.resolutionRate}%`, icon: TrendingUp },
            { label: 'Time to Order', value: `${Math.round(operationalMetrics.averageTimeToOrder / 60)}m`, icon: BarChart3 },
          ].map((item) => (
            <div key={item.label} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Sub-stats row */}
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {operationalMetrics.callsWithOrders} calls with orders
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            {operationalMetrics.callsWithoutOrders} calls without orders
          </span>
        </div>

        {/* Charts Row 1: Revenue Timeline + Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Timeline */}
          <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Revenue & Call Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={charts.revenueTimeline}>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => new Date(v + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis yAxisId="revenue" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="calls" orientation="right" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [name === 'revenue' ? formatCurrencyFull(value) : value, name === 'revenue' ? 'Revenue' : 'Calls']}
                  labelFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Bar yAxisId="revenue" dataKey="revenue" fill="#22c55e" opacity={0.3} radius={[4, 4, 0, 0]} />
                <Line yAxisId="calls" type="monotone" dataKey="calls" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Conversion Funnel</h2>
            <div className="space-y-3">
              {funnelData.map((step, idx) => {
                const pct = funnel.totalCalls > 0 ? Math.round((step.value / funnel.totalCalls) * 100) : 0;
                return (
                  <div key={step.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{step.name}</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{step.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full h-6 bg-gray-100 dark:bg-white/[0.05] rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: step.fill }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Order Type + Hourly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Type Distribution */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Order Type Distribution</h2>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.orderTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.orderTypeDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-2.5">
                {charts.orderTypeDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{item.name.toLowerCase()}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Activity */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Hourly Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.hourlyActivity}>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(v: number) => `${v}:00`}
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }}
                  labelFormatter={(v) => `${v}:00 - ${v}:59`}
                />
                <Bar dataKey="calls" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.8} name="Calls" />
                <Bar dataKey="orders" fill="#f97316" radius={[3, 3, 0, 0]} opacity={0.8} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Intent Distribution</h2>
          <div className="flex flex-wrap gap-3">
            {charts.intentDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Accounts Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.06] flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Accounts by Revenue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  {['Rank', 'Name', 'Company', 'Orders', 'Revenue', 'Avg Order'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {data.topCallers.map((caller, idx) => (
                  <tr key={caller.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        idx === 0 ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                        idx === 1 ? 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400' :
                        idx === 2 ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400' :
                        'bg-gray-50 dark:bg-white/[0.03] text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{caller.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{caller.company || '—'}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{caller.totalOrders}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrencyFull(caller.totalRevenue)}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{formatCurrencyFull(caller.averageOrderValue)}</td>
                  </tr>
                ))}
                {data.topCallers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabbed: Recent Orders / Recent Activity */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-white/[0.06] flex items-center gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'orders'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Recent Orders
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'activity'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Recent Activity
            </button>
          </div>

          {activeTab === 'orders' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    {['Order #', 'Caller', 'Company', 'Type', 'Status', 'Guests', 'Total', 'Date'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 text-sm font-mono font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{order.caller}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{order.company || '—'}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          {order.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{order.guestCount || '—'}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrencyFull(order.total)}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data.recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    {['Caller', 'Intent', 'Status', 'Duration', 'Order $', 'Resolved', 'Time', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {data.recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{activity.caller}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{activity.intent || '—'}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor[activity.status] || 'bg-gray-100 text-gray-600'}`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{activity.duration ? `${activity.duration}s` : '—'}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {activity.orderTotal ? formatCurrencyFull(activity.orderTotal) : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {activity.resolved ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => setSelectedCall(activity.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 font-medium transition-colors"
                        >
                          Transcript
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">No recent activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
                &times;
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
