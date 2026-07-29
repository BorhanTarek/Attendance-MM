const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@company.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const employeePassword = await bcrypt.hash('employee123', 10);
  
  // Create a default location
  const hq = await prisma.location.create({
    data: {
      name: 'Headquarters',
      latitude: 40.7128, // NY coordinates
      longitude: -74.0060,
      radius: 100, // 100 meters
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'employee@company.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      assignedLocationId: hq.id
    },
  });

  console.log('Seed completed: Admin and Employee accounts created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
