import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin' },
      update: {},
      create: {
        email: 'admin',
        password: hashedPassword,
        isAdmin: true,
        rateLimit: 1000
      },
    });

    console.log({ admin });

    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: await bcryptjs.hash('test123', 10),
        isAdmin: false,
        rateLimit: 60
      },
    });

    console.log({ testUser });
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
