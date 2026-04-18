// app/api/auth/[...nextauth]/route.ts
// This file configures NextAuth.js for authentication using credentials (username/password).
// It handles sign-in, sign-out, session management, and includes special logic for a demo user.

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema for login credentials using Zod
const loginSchema = z.object({
  username: z.string().min(1), // username must not be empty
  password: z.string().min(1), // password must not be empty
});

// Export NextAuth handlers, signIn, signOut, and auth helper
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      // authorize function validates credentials and returns user object if successful
      async authorize(credentials) {
        // Validate credentials format
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { username, password } = parsed.data;

        // Special handling for demo user
        if (username === 'demo_user') {
          // Ensure demo user exists in database
          let demoUser = await prisma.user.findUnique({ where: { name: 'demo_user' } });
          if (!demoUser) {
            const demoPasswordHash = await bcrypt.hash('demo123456', 10);
            demoUser = await prisma.user.create({
              data: { name: 'demo_user', password: demoPasswordHash },
            });
          }
          // Clear all previous journal entries for demo user (fresh start each session)
          await prisma.journalEntry.deleteMany({ where: { userId: demoUser.id } });
          // Return demo user object
          return { id: demoUser.id, name: demoUser.name };
        }

        // Regular user flow: find user by username
        const user = await prisma.user.findUnique({ where: { name: username } });
        if (!user) return null;
        // Compare provided password with stored hash
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        // Return user object (excluding password)
        return { id: user.id, name: user.name };
      },
    }),
  ],
  callbacks: {
    // Add user id to the JWT token
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Add user id to the session object (available client-side)
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  // Custom pages for sign-in and sign-up
  pages: { signIn: "/login", newUser: "/signup" },
  session: { strategy: "jwt" }, // Use JWT for session storage
  secret: process.env.AUTH_SECRET, // Secret key for encryption (must be set in .env.local)
});

// Export HTTP methods for Next.js App Router (required for route handlers)
export const GET = handlers.GET;
export const POST = handlers.POST;