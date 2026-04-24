import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const demoUsername = 'demo_user';
  const demoPassword = 'demo123456';

  const existing = await prisma.user.findUnique({ where: { name: demoUsername } });
  if (!existing) {
    const hashed = await bcrypt.hash(demoPassword, 10);
    await prisma.user.create({
      data: { name: demoUsername, password: hashed },
    });
    console.log('Demo user created');
  } else {
    console.log('Demo user already exists');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());