// app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isDemoUser = session?.user?.name === 'demo_user';

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (isDemoUser) {
      setError('Demo account cannot be deleted.');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete your account? This action is permanent and will erase all your journal entries.');
    if (!confirmed) return;

    setIsDeleting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect to homepage
      await signOut({ redirect: false });
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-600 px-4 py-2 rounded-full shadow-sm hover:bg-indigo-50 hover:shadow-md transition"
          >
            ← Back to Journal
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-500 mb-8">Manage your password and account</p>

          {/* Display username */}
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="text-lg font-semibold">{session?.user?.name}</p>
            {isDemoUser && (
              <p className="text-xs text-gray-500 mt-1">Demo account – entries are cleared on each login</p>
            )}
          </div>

          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Change Password Section */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  disabled={isChangingPassword}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  disabled={isChangingPassword}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  disabled={isChangingPassword}
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Delete Account Section */}
          <div>
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. All your journal entries will be permanently removed.
            </p>
            {isDemoUser && (
              <p className="text-amber-600 text-sm mb-3">
                ⚠️ Demo accounts cannot be deleted. If you need a fresh start, just log out and log in again – all entries are cleared automatically.
              </p>
            )}
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || isDemoUser}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDemoUser
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}