// app/api/journal-entries/route.ts
// This API endpoint handles operations on the collection of journal entries:
// GET (fetch all entries for the authenticated user) and POST (create a new entry).

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route'; // NextAuth helper
import { prisma } from '@/lib/prisma'; // Prisma client

// Helper function to extract the logged-in user's ID from the session
async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// GET /api/journal-entries - Fetch all entries for the logged-in user
export async function GET() {
  // 1. Authenticate the user
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Fetch all entries belonging to this user, ordered by newest first
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Return entries as JSON
  return NextResponse.json(entries);
}

// POST /api/journal-entries - Create a new journal entry
export async function POST(request: Request) {
  // 1. Authenticate the user
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Extract data from the request body
  const { title, content, subject, emotion } = await request.json();

  // 3. Validate required fields
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  // 4. Prepare the subject (topics) field – default to "General" if empty
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';

  // 5. Create the entry in the database
  const entry = await prisma.journalEntry.create({
    data: {
      title,
      content,
      emotion: emotion || 'neutral', // fallback to neutral if no emotion selected
      topics: topicsString,
      userId,
    },
  });

  // 6. Return the newly created entry with HTTP 201 status (Created)
  return NextResponse.json(entry, { status: 201 });
}