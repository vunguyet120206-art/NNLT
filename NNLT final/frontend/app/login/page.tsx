'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { saveAuthTokens } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      saveAuthTokens(response);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-8">
      <div className="max-w-md w-full bg-white rounded-xl p-10 shadow-2xl">
        <h1 className="mb-8 text-center text-3xl font-semibold text-gray-800">Login</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="block mb-2 font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hero-lab.com"
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
            />
          </div>

          <div className="form-group mt-6">
            <label htmlFor="password" className="block mb-2 font-medium text-gray-600">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1234"
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full mt-6 py-3.5 bg-primary text-white border-none rounded-lg text-base font-medium transition-all duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account? <Link href="/register" className="text-primary font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
