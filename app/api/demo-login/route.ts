// app/api/demo-login/route.ts
// This API endpoint logs the user in as a shared demo user.
// It automatically creates the demo user if missing, clears all previous demo entries,
// then signs in using NextAuth credentials provider.

import { NextResponse } from 'next/server';
import { signIn } from '@/app/api/auth/[...nextauth]/route'; // NextAuth signIn function
import { prisma } from '@/lib/prisma'; // Prisma client for database access
import bcrypt from 'bcryptjs'; // For hashing the demo user's password

export async function POST() {
  const demoUsername = 'demo_user';
  const demoPassword = 'demo123456';

  try {
    // 1. Check if the demo user already exists in the database
    let demoUser = await prisma.user.findUnique({
      where: { name: demoUsername },
    });

    // 2. If the demo user does not exist, create it with a hashed password
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash(demoPassword, 10);
      demoUser = await prisma.user.create({
        data: {
          name: demoUsername,
          password: hashedPassword,
        },
      });
    }

    // 3. Delete all journal entries belonging to the demo user
    //    This ensures every demo session starts with a clean slate
    await prisma.journalEntry.deleteMany({
      where: { userId: demoUser.id },
    });

    // 4. Automatically sign in as the demo user using NextAuth credentials
    const result = await signIn('credentials', {
      username: demoUsername,
      password: demoPassword,
      redirect: false, // Do not redirect automatically, we handle response
    });

    // 5. If sign-in fails, return an error response
    if (result?.error) {
      return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
    }

    // 6. Success: return a success message
    return NextResponse.json({ message: 'Logged in as demo user (entries cleared)' });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}