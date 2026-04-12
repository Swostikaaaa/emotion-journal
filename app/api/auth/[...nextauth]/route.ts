import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { username, password } = parsed.data;
        
        // Handle demo user
        if (username === 'demo_user') {
          // Ensure demo user exists
          let demoUser = await prisma.user.findUnique({ where: { name: 'demo_user' } });
          if (!demoUser) {
            const demoPasswordHash = await bcrypt.hash('demo123456', 10);
            demoUser = await prisma.user.create({
              data: { name: 'demo_user', password: demoPasswordHash },
            });
          }
          // Clear all journal entries for demo user on each login
          await prisma.journalEntry.deleteMany({ where: { userId: demoUser.id } });
          return { id: demoUser.id, name: demoUser.name };
        }
        
        // Regular user flow
        const user = await prisma.user.findUnique({ where: { name: username } });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return { id: user.id, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/login", newUser: "/signup" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
