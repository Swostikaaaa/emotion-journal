//Script to ping Neon database every 4 minutes to prevent idle suspension.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function keepAlive() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database keep-alive pinged at:', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Keep-alive failed:', error);
  }
}

setInterval(keepAlive, 4 * 60 * 1000);
console.log('Keep-alive service started. Pinging every 4 minutes.');
