// app/page.tsx (Landing Page)
// This is the entry point of the application. It displays a welcome message,
// provides buttons for login, signup, and a demo mode that automatically logs in
// as a shared demo user.

'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function Home() {
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');

  // Handle demo login: automatically sign in with hardcoded demo credentials
  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setDemoError('');

    // Attempt to sign in using NextAuth credentials provider
    const result = await signIn('credentials', {
      username: 'demo_user',
      password: 'demo123456',
      redirect: false, // Prevent automatic redirect; handle manually
    });

    if (result?.error) {
      setDemoError('Demo login failed. Please try signing up.');
      setDemoLoading(false);
    } else {
      window.location.href = '/journal'; // Redirect to journal page on success
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Glass‑card container with floating animation */}
      <div className="max-w-2xl w-full glass-card p-8 md:p-12 text-center floating">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-4">
          Emotion Journal
        </h1>
        <p className="text-xl font-semibold text-white drop-shadow mb-3">
          Write freely. Understand your emotions. Grow every day.
        </p>
        <p className="text-lg text-white/90 drop-shadow mb-8">
          Your private space to reflect, track moods, and see your journey over time.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link
            href="/login"
            className="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-indigo-50 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:shadow-md transition"
          >
            Sign Up
          </Link>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="bg-gray-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            Try Demo
          </button>
        </div>

        {/* Show error message if demo login fails */}
        {demoError && <p className="text-red-300 text-sm mt-2">{demoError}</p>}

        {/* Demo mode info badge */}
        <p className="bg-purple-500/20 backdrop-blur-sm text-purple-100 text-sm font-bold px-4 py-2 rounded-full inline-block mt-6 shadow-md">
          ✨ Demo mode lets you explore without signing up
        </p>
      </div>
    </main>
  );
}