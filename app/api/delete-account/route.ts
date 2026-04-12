import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Prevent deletion of the demo user
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (user?.name === 'demo_user') {
    return NextResponse.json({ error: 'Demo account cannot be deleted' }, { status: 403 });
  }

  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    });
    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}