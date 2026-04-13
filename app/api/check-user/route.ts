import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { name: username } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User exists' });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}