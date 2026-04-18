// app/api/check-user/route.ts
// This API endpoint checks whether a given username exists in the database.
// It is used during the password reset flow to verify the user before allowing a password change.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Prisma client for database access

export async function POST(request: Request) {
  try {
    // 1. Extract username from the request body
    const { username } = await request.json();

    // 2. Validate that username is provided
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // 3. Query the database for a user with the given username
    const user = await prisma.user.findUnique({ where: { name: username } });

    // 4. If no user found, return 404 error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 5. User exists – return success response
    return NextResponse.json({ message: 'User exists' });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}