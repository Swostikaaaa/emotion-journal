import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { detectEmotion } from '@/lib/emotion';

// Helper to get the user ID from the session
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { title, content, subject } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    // Emotion detection (for the mood badge)
    const emotion = await detectEmotion(content);
    // Subject (user-provided free text) – fallback to "General"
    const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';

    const entry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        emotion,
        topics: topicsString,
        userId,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}