// app/(protected)/layout.tsx
// This layout wraps all pages inside the (protected) folder.
// It checks if the user is authenticated before allowing access to any protected page.

import { auth } from '@/app/api/auth/[...nextauth]/route'; // Import the NextAuth authentication helper
import { redirect } from 'next/navigation'; // Import Next.js redirect function

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current user session (server-side)
  const session = await auth();

  // If there is no active session (user not logged in), redirect to the login page
  if (!session) {
    redirect('/login');
  }

  // If authenticated, render the child components (the actual page content)
  return <>{children}</>;
}