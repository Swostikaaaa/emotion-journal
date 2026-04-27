// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { username } = parsed.data;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { name: username },
    });

    if (!user) {
      // For security, don't reveal that the user doesn't exist
      return NextResponse.json({ message: 'If an account exists, a reset link will be sent.' });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Save the token to the database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // In a real app, you would send an email with a link containing this token.
    // For your thesis, you can display the link in the console or on the page.
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log(`Reset URL for ${username}: ${resetUrl}`);

    return NextResponse.json({ message: 'If an account exists, a reset link will be sent.', resetUrl: resetUrl });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}