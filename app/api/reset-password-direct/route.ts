// app/api/reset-password-direct/route.ts
// This API endpoint allows a user to reset their password directly using their username.
// It is called from the reset password page after the user has verified their identity via the username.
// No email or token is required (simplified for the demo).

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for the password reset request
const resetSchema = z.object({
  username: z.string().min(1),            // username must not be empty
  newPassword: z.string().min(6),        // new password must be at least 6 characters
});

export async function POST(request: Request) {
  try {
    // 1. Parse and validate the request body
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      // Return the first validation error message
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { username, newPassword } = parsed.data;

    // 2. Find the user by username
    const user = await prisma.user.findUnique({ where: { name: username } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 5. Return success response
    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}