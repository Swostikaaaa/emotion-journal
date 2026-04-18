// app/forgot-password/page.tsx
// This page allows a user to request a password reset by entering their username.
// After verification, they are redirected to the reset-password page with the username as a query parameter.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission – check if username exists, then redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Call the check-user API to verify if the username exists
    const res = await fetch('/api/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();

    if (!res.ok) {
      // If user not found or other error, display error message
      setError(data.error || 'User not found');
      setIsLoading(false);
    } else {
      // User exists – redirect to reset-password page with username in URL
      router.push(`/reset-password?username=${encodeURIComponent(username)}`);
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
      {/* Glass card container with dark overlay for readability */}
      <div className="max-w-md w-full glass-card p-8 floating" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        {/* Back button to login page */}
        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition mb-6">
          ← Back to Login
        </Link>
        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2 text-center">Forgot Password</h1>
        <p className="text-white/80 mb-6">Enter your username to reset your password.</p>

        {/* Display error message if any */}
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-semibold transition"
          >
            {isLoading ? 'Checking...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </main>
  );
}