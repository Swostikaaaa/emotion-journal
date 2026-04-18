// app/api/journal-entries/[id]/route.ts
// This API endpoint handles operations on a single journal entry: GET (fetch one entry),
// PUT (update), and DELETE (remove). All operations require authentication and verify
// that the entry belongs to the logged-in user.

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route'; // NextAuth helper
import { prisma } from '@/lib/prisma'; // Prisma client

// Helper function to extract the logged-in user's ID from the session
async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// GET /api/journal-entries/[id] - Fetch a single entry
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Extract entry ID from URL parameters (params is a Promise)
  const { id } = await params;

  // 3. Find the entry only if it belongs to the current user
  const entry = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 4. Return the entry as JSON
  return NextResponse.json(entry);
}

// PUT /api/journal-entries/[id] - Update an existing entry
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get entry ID and request body
  const { id } = await params;
  const body = await request.json();
  const { title, content, subject, emotion } = body;

  // 3. Validate required fields
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  // 4. Verify the entry exists and belongs to the user
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 5. Prepare the subject (topics) field – default to "General" if empty
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';

  // 6. Update the entry in the database
  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      title,
      content,
      emotion: emotion || 'neutral', // fallback to neutral if no emotion selected
      topics: topicsString,
      updatedAt: new Date(),
    },
  });

  // 7. Return the updated entry
  return NextResponse.json(updated);
}

// DELETE /api/journal-entries/[id] - Delete an entry
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get entry ID
  const { id } = await params;

  // 3. Verify the entry exists and belongs to the user
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 4. Delete the entry
  await prisma.journalEntry.delete({ where: { id } });

  // 5. Return success message
  return NextResponse.json({ message: 'Deleted' });
}