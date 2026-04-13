'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await signIn('credentials', { username, password, redirect: false });
    if (result?.error) {
      setError('Invalid username or password');
      setIsLoading(false);
    } else {
      router.push('/journal');
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-md w-full glass-card p-8 floating" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <Link href="/" className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition mb-6">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Welcome Back</h1>
        <p className="text-white/80 mb-6">Log in to continue your journal</p>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10"
    required
    disabled={isLoading}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
          <div className="flex justify-end">
  <Link href="/forgot-password" className="text-sm text-white/70 hover:text-white">
    Forgot password?
  </Link>
</div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-semibold transition"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/70 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}