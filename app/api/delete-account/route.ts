import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Prevent deletion of demo user
  if (user.name === 'demo_user') {
    return NextResponse.json({ error: 'Demo account cannot be deleted' }, { status: 403 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ message: 'Account deleted successfully' });
}
