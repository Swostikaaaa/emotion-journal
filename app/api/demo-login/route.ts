import { NextResponse } from 'next/server';
import { signIn } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  const demoUsername = 'demo_user';
  const demoPassword = 'demo123456';

  try {
    // Ensure demo user exists (recreate if deleted)
    let demoUser = await prisma.user.findUnique({
      where: { name: demoUsername },
    });

    if (!demoUser) {
      // Recreate demo user if missing (e.g., after deletion)
      const hashedPassword = await bcrypt.hash(demoPassword, 10);
      demoUser = await prisma.user.create({
        data: {
          name: demoUsername,
          password: hashedPassword,
        },
      });
    }

    // Delete ALL journal entries for demo user (fresh start every demo session)
    await prisma.journalEntry.deleteMany({
      where: { userId: demoUser.id },
    });

    // Sign in as demo user
    const result = await signIn('credentials', {
      username: demoUsername,
      password: demoPassword,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Logged in as demo user (entries cleared)' });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}