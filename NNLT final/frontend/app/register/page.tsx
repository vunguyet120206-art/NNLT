'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { saveAuthTokens } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(email, username, password);
      saveAuthTokens(response);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.password?.[0] || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-8">
      <div className="max-w-[450px] w-full bg-white rounded-xl p-10 shadow-2xl">
        <h1 className="mb-8 text-center text-3xl font-semibold text-gray-800">Create Account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="block mb-2 font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
            />
          </div>

          <div className="form-group mt-6">
            <label htmlFor="username" className="block mb-2 font-medium text-gray-600">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
            />
          </div>

          <div className="form-group mt-6">
            <label htmlFor="passwordConfirm" className="block mb-2 font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={8}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-primary font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
