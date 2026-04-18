// lib/prisma.ts
// This file initializes and exports a singleton PrismaClient instance.
// Using a singleton prevents exhausting database connections during development
// (hot reloading would otherwise create many clients).

import { PrismaClient } from '@prisma/client'

// Extend the global object in development to store the PrismaClient instance
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a new PrismaClient if one doesn't exist, otherwise reuse the existing one
export const prisma = globalForPrisma.prisma || new PrismaClient()

// In non‑production environments (development), attach the client to the global object
// so it survives hot reloads.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma