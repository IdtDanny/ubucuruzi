import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Roles
  const roles = [
    { name: 'Owner', permissions: ['*'], isSystem: true },
    { name: 'Admin', permissions: ['users:manage', 'products:*', 'sales:*', 'reports:view'], isSystem: true },
    { name: 'Manager', permissions: ['products:*', 'sales:*', 'inventory:view', 'customers:view'], isSystem: true },
    { name: 'Cashier', permissions: ['sales:create', 'sales:view', 'customers:view', 'payments:create'], isSystem: true },
    { name: 'Viewer', permissions: ['reports:view', 'products:view', 'sales:view'], isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`✅ Role "${role.name}" seeded`);
  }

  // 2. Dummy User
  const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' } });
  if (!ownerRole) throw new Error('Owner role not found');

  const defaultTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      subdomain: 'demo',
      email: 'admin@example.com',
    },
  });

  const hashedPassword = await bcrypt.hash('password123', 10);
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: hashedPassword,
      isActive: true,
    },
  });

  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: defaultUser.id,
        tenantId: defaultTenant.id,
      },
    },
    update: {},
    create: {
      userId: defaultUser.id,
      tenantId: defaultTenant.id,
      roleId: ownerRole.id,
      assignedBy: defaultUser.id,
    },
  });

  console.log('✅ Dummy user created: admin@example.com / password123');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => console.error('❌ Seed failed:', e))
  .finally(() => prisma.$disconnect());

// import 'dotenv/config';
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log('🌱 Seeding database...');

//   const roles = [
//     { name: 'Owner', permissions: ['*'], isSystem: true },
//     { name: 'Admin', permissions: ['users:manage', 'products:*', 'sales:*', 'reports:view'], isSystem: true },
//     { name: 'Manager', permissions: ['products:*', 'sales:*', 'inventory:view', 'customers:view'], isSystem: true },
//     { name: 'Cashier', permissions: ['sales:create', 'sales:view', 'customers:view', 'payments:create'], isSystem: true },
//     { name: 'Viewer', permissions: ['reports:view', 'products:view', 'sales:view'], isSystem: true },
//   ];

//   for (const role of roles) {
//     await prisma.role.upsert({
//       where: { name: role.name },
//       update: {},
//       create: role,
//     });
//     console.log(`✅ Role "${role.name}" seeded`);
//   }

//   console.log('🎉 Seeding complete!');
// }

// main()
//   .catch((e) => console.error('❌ Seed failed:', e))
//   .finally(() => prisma.$disconnect());