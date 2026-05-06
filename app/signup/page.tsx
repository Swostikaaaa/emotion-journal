// app/signup/page.tsx
// This page allows new users to create an account.
// It sends a request to the signup API, then automatically logs the user in.

'use client';

// Import React useState hook for managing component state
import { useState } from 'react';
// Import useRouter from Next.js navigation for programmatic redirects
import { useRouter } from 'next/navigation';
// Import signIn function from next-auth/react to auto-login after signup
import { signIn } from 'next-auth/react';
// Import Link component for client-side navigation between pages
import Link from 'next/link';
// Import eye icons from lucide-react for password visibility toggle
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  // Router instance to redirect after successful account creation
  const router = useRouter();
  // State for the username input field
  const [username, setUsername] = useState('');
  // State for the password input field
  const [password, setPassword] = useState('');
  // State for displaying error messages (e.g., username taken, validation failures)
  const [error, setError] = useState('');
  // State to disable form and show loading indicator during account creation
  const [isLoading, setIsLoading] = useState(false);
  // Toggle for password visibility: true = show plain text, false = show dots
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission: create user account, then automatically sign in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();               // Prevent default browser form submission
    setIsLoading(true);               // Show loading state and disable inputs
    setError('');                     // Clear any previous error message

    // 1. Call the signup API to create the user
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }), // Send credentials in request body
    });

    const data = await res.json();    // Parse JSON response from API
    if (!res.ok) {
      // If API returns an error (e.g., username already taken, validation failed)
      setError(data.error || 'Something went wrong');
      setIsLoading(false);            // Re-enable the form
      return;                         // Exit early – do not attempt auto-login
    }

    // 2. If signup succeeded, automatically log the user in using NextAuth credentials provider
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,               // Handle redirect manually to show error if needed
    });

    if (result?.error) {
      // Auto-login failed for some reason (unlikely, but handle gracefully)
      setError('Account created, but auto‑login failed. Please log in manually.');
      router.push('/login');         // Send user to login page to sign in manually
    } else {
      // On successful auto-login, redirect to the protected journal page
      router.push('/journal');
    }
  };

  return (
    // Main container: full viewport height, centered content, background image
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Glassmorphism card container with floating animation and semi-transparent background */}
      <div className="max-w-md w-full glass-card p-8 floating" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        {/* Back to home button - navigates to landing page */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition mb-6"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2 text-center">Create Account</h1>
        <p className="text-white/70 mb-6">Start your private journaling journey</p>

        {/* Display error message if any (e.g., username taken, password too short) */}
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username field */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              required                // HTML5 required validation
              disabled={isLoading}    // Disable while creating account
            />
          </div>

          {/* Password field with visibility toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}   // Toggle between text and password input types
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10"
              required
              disabled={isLoading}
            />
            {/* Button to toggle password visibility */}
            <button
              type="button"                     // Prevent form submission
              onClick={() => setShowPassword(!showPassword)}  // Toggle state
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit button – shows loading text during account creation */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-semibold transition"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login link for users who already have an account */}
        <p className="text-center text-sm text-white/70 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}