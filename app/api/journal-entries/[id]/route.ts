import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const entry = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(entry);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { title, content, subject, emotion } = body;
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';
  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      title,
      content,
      emotion: emotion || 'neutral',
      topics: topicsString,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}
