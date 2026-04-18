// app/settings/page.tsx
// This page allows authenticated users to change their password or delete their account.
// It includes password visibility toggles and special handling for the demo user.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession(); // Get current user session
  const router = useRouter();

  // State for password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State for account deletion
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Visibility toggles for password fields
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const isDemoUser = session?.user?.name === 'demo_user';

  // Handle password change form submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    setError('');
    setMessage('');

    try {
      // Call API to change password
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setMessage('Password changed successfully!');
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Prevent deletion of demo user
    if (isDemoUser) {
      setError('Demo account cannot be deleted.');
      return;
    }
    if (!deletePassword) {
      setError('Please enter your password to confirm deletion.');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete your account? This action is permanent and will erase all your journal entries.');
    if (!confirmed) return;

    setIsDeleting(true);
    setError('');
    setMessage('');

    try {
      // Call API to delete account
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      // Sign out and redirect to home page
      await signOut({ redirect: false });
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Back button to journal page */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition mb-8"
        >
          ← Back to Journal
        </Link>

        {/* Main settings card */}
        <div className="glass-card p-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-white/80 mb-8">Manage your password and account</p>

          {/* User info display */}
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-white/70">Logged in as</p>
            <p className="text-lg font-semibold text-white">{session?.user?.name}</p>
            {isDemoUser && <p className="text-xs text-white/50 mt-1">Demo account – entries are cleared on each login</p>}
          </div>

          {/* Success/error messages */}
          {message && <div className="bg-green-500/20 text-green-200 p-3 rounded-lg mb-6 text-sm">{message}</div>}
          {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6 text-sm">{error}</div>}

          {/* Change Password Section */}
          <div className="border-b border-white/20 pb-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10"
                    required
                    disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10"
                    required
                    disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10"
                    required
                    disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isChangingPassword} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition">
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Delete Account Section (Danger Zone) */}
          <div>
            <h2 className="text-xl font-semibold text-red-300 mb-4">Danger Zone</h2>
            <p className="text-white/80 mb-4">Once you delete your account, there is no going back. All your journal entries will be permanently removed.</p>
            {isDemoUser && <p className="text-amber-300 text-sm mb-3">⚠️ Demo accounts cannot be deleted.</p>}

            {/* Password confirmation field for deletion */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1">Confirm with password</label>
              <div className="relative">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10"
                  disabled={isDeleting || isDemoUser}
                />
                <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                  {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || isDemoUser}
              className={`px-4 py-2 rounded-lg font-medium transition ${isDemoUser ? 'bg-gray-500 text-white cursor-not-allowed' : 'bg-red-500/70 hover:bg-red-500 text-white'}`}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}