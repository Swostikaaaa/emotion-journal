// app/api/change-password/route.ts
// This API endpoint allows an authenticated user to change their password.
// It verifies the current password, then hashes and stores the new password.

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route'; // NextAuth helper to get current session
import { prisma } from '@/lib/prisma'; // Prisma client for database access
import bcrypt from 'bcryptjs'; // For hashing and comparing passwords
import { z } from 'zod'; // For input validation

// Validation schema for the password change request
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(request: Request) {
  // 1. Authenticate the user – ensure they are logged in
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Parse and validate the request body
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      // Return the first validation error message
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // 3. Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Verify that the provided current password matches the stored hash
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // 5. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update the user's password in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // 7. Return success response
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}