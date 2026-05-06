// app/login/page.tsx
// This is the login page where users can sign in with their username and password.
// It uses NextAuth's signIn function to authenticate and includes a password visibility toggle.

'use client';

// Import React useState hook for managing component state
import { useState } from 'react';
// Import signIn function from next-auth/react to handle credentials authentication
import { signIn } from 'next-auth/react';
// Import useRouter from Next.js navigation for programmatic redirects
import { useRouter } from 'next/navigation';
// Import Link component for client-side navigation between pages
import Link from 'next/link';
// Import eye icons from lucide-react for password visibility toggle
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  // Router instance to redirect after successful login
  const router = useRouter();
  // State for the username input field
  const [username, setUsername] = useState('');
  // State for the password input field
  const [password, setPassword] = useState('');
  // State for displaying authentication error messages
  const [error, setError] = useState('');
  // State to disable form and show loading indicator during sign-in
  const [isLoading, setIsLoading] = useState(false);
  // Toggle for password visibility: true = show plain text, false = show dots
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission: call NextAuth credentials provider
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();               // Prevent default browser form submission
    setIsLoading(true);               // Show loading state and disable inputs
    setError('');                     // Clear any previous error message

    // Attempt to sign in with provided credentials using NextAuth's credentials provider
    // redirect: false prevents automatic redirect, allowing manual handling
    const result = await signIn('credentials', { username, password, redirect: false });

    // If signIn returned an error property, authentication failed
    if (result?.error) {
      setError('Invalid username or password');  // User-friendly error message
      setIsLoading(false);                       // Re-enable the form
    } else {
      // On successful authentication, redirect user to the journal page
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

        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2 text-center">Welcome Back</h1>
        <p className="text-white/80 mb-6 text-center">Log in to continue your journal</p>

        {/* Display error message if any (invalid credentials) */}
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username field */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              required                // HTML5 required validation
              disabled={isLoading}    // Disable while authenticating
            />
          </div>

          {/* Password field with visibility toggle */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}   // Toggle between text and password input types
                value={password}
                onChange={e => setPassword(e.target.value)}
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
          </div>

          {/* Forgot password link (placeholder – can be implemented later) */}
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-white/70 hover:text-white">
              Forgot password?
            </Link>
          </div>

          {/* Submit button – shows loading text when authenticating */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-semibold transition"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Signup link for users without an account */}
        <p className="text-center text-sm text-white/70 mt-6">
          Don't have an account? <Link href="/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}