const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_USERNAME + '@admin.com';

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
          rateLimit: 1000
        }
      });
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
