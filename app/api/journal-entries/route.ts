import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const entries = await prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { title, content, subject, emotion } = await request.json();
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';
  const entry = await prisma.journalEntry.create({
    data: { title, content, emotion: emotion || 'neutral', topics: topicsString, userId },
  });
  return NextResponse.json(entry, { status: 201 });
}
