// Import NextResponse to create HTTP responses in Next.js API routes
import { NextResponse } from 'next/server';
// Import the Prisma client instance to interact with the database
import { prisma } from '@/lib/prisma';
// Import bcryptjs for hashing passwords before storing them
import bcrypt from 'bcryptjs';
// Import zod for schema-based input validation
import { z } from 'zod';

// Define a validation schema for the signup request body using zod
const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'), // Username must be at least 3 characters long
  password: z.string().min(6, 'Password must be at least 6 characters'), // Password must be at least 6 characters long
});

// POST handler: receives signup data, validates, hashes password, creates a new user
export async function POST(request: Request) {
  try {
    // Parse the incoming JSON request body
    const body = await request.json();
    // Validate the body against the signupSchema
    const parsed = signupSchema.safeParse(body);
    // If validation fails, return the first error message with status 400 Bad Request
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    // Extract validated username and password from the parsed data
    const { username, password } = parsed.data;

    // Check if a user with the same username already exists in the database
    const existing = await prisma.user.findUnique({ where: { name: username } });
    if (existing) {
      // If username is taken, return an error message with status 400
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Hash the plaintext password using bcrypt with a salt rounds of 10
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user record in the database with the username and hashed password
    const user = await prisma.user.create({
      data: { name: username, password: hashedPassword },
    });
    // Return a success response with the newly created user's ID and status 201 Created
    return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 });
  } catch (error) {
    // Log any unexpected errors (database, network, etc.) to the server console
    console.error('Signup error:', error);
    // Return a generic internal server error response
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}