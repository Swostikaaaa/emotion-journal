// app/api/delete-account/route.ts
// This API endpoint allows an authenticated user to permanently delete their account.
// It verifies the user's password and prevents deletion of the demo user.

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route'; // NextAuth helper to get current session
import { prisma } from '@/lib/prisma'; // Prisma client for database access
import bcrypt from 'bcryptjs'; // For password verification

export async function DELETE(request: Request) {
  // 1. Authenticate the user – ensure they are logged in
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Extract password from the request body (for confirmation)
  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  // 3. Fetch the user from the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 4. Prevent deletion of the demo user (demo account is shared)
  if (user.name === 'demo_user') {
    return NextResponse.json({ error: 'Demo account cannot be deleted' }, { status: 403 });
  }

  // 5. Verify the provided password matches the stored hash
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  // 6. Delete the user from the database (all journal entries will be deleted due to cascade)
  await prisma.user.delete({ where: { id: session.user.id } });

  // 7. Return success response
  return NextResponse.json({ message: 'Account deleted successfully' });
}