'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, LoginData } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  console.log('LoginPage component loaded');

  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (registered === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [registered]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called!', e);
    e.preventDefault();
    console.log('preventDefault called');
    setError('');
    setLoading(true);

    console.log('=== LOGIN DEBUG ===');
    console.log('Username:', formData.username);
    console.log('Password length:', formData.password.length);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    try {
      console.log('Calling login API...');
      const response = await api.login(formData);
      console.log('Login response:', response);
      
      if (response.token) {
        console.log('Token received, saving to localStorage');
        localStorage.setItem('authToken', response.token);
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        console.error('No token in response:', response);
        setError('Login failed: No token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error message:', err.message);
      try {
        const errorData = JSON.parse(err.message);
        console.error('Parsed error:', errorData);
        setError(errorData.error?.message || 'Invalid username or password');
      } catch (parseError) {
        console.error('Could not parse error:', parseError);
        setError('Invalid username or password');
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✓ Account created! Please check your email to verify your account.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={() => console.log('Button clicked!')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
