import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { detectEmotion } from '@/lib/emotion';
import { extractTopics } from '@/lib/topics';

// Helper to get the user ID from the session
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error('GET /api/journal-entries/[id] error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    // First verify the entry belongs to the user
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const emotion = await detectEmotion(content);
    const topics = extractTopics(content);
    const topicsString = topics.join(',');

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: { title, content, emotion, topics: topicsString, updatedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/journal-entries/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    // Verify ownership before deleting
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await prisma.journalEntry.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/journal-entries/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}