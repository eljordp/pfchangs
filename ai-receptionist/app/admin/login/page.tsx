'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute top-6 right-8">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            P.F. Chang&apos;s AI
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Login</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Sign in to access the dashboard</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                placeholder="admin@pfchangs.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
