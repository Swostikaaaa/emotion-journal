// app/providers.tsx
// This component wraps the application with the NextAuth SessionProvider.
// It makes the authentication session available to all client components.

'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider gives access to useSession() hook anywhere in the app
  return <SessionProvider>{children}</SessionProvider>;
}