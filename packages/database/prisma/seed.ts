import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────
async function generateUniqueNumber(prefix: string, model: any, where: any = {}) {
  const count = await model.count({ where });
  return `${prefix}-${String(count + 1).padStart(6, '0')}`;
}

// ─── Main ──────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...');

  // ─── Roles ──────────────────────────────────────────────
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
  }
  console.log('✅ Roles seeded');

  // ─── Default Tenant ─────────────────────────────────────
  const defaultTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      subdomain: 'demo',
      email: 'admin@example.com',
    },
  });
  console.log('✅ Tenant seeded');

  // ─── Default User ──────────────────────────────────────
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

  const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' } });
  if (!ownerRole) throw new Error('Owner role not found');

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
  console.log('✅ Default user seeded: admin@example.com / password123');

  // ─── Units of Measure ──────────────────────────────────
  const units = [
    { name: 'Piece', symbol: 'pc' },
    { name: 'Kilogram', symbol: 'kg' },
    { name: 'Gram', symbol: 'g' },
    { name: 'Liter', symbol: 'L' },
    { name: 'Meter', symbol: 'm' },
    { name: 'Box', symbol: 'bx' },
  ];
  for (const unit of units) {
    await prisma.unitOfMeasure.upsert({
      where: { id: `unit_${unit.symbol}` },
      update: {},
      create: { ...unit, tenantId: defaultTenant.id },
    });
  }
  console.log('✅ Units of measure seeded');

  // ─── Categories ────────────────────────────────────────
  const categories = [
    { name: 'Electronics', description: 'Phones, laptops, accessories' },
    { name: 'Clothing', description: 'Apparel and fashion' },
    { name: 'Food & Beverage', description: 'Perishable and packaged goods' },
    { name: 'Hardware', description: 'Tools, building materials' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: `cat_${cat.name.toLowerCase()}` },
      update: {},
      create: { ...cat, tenantId: defaultTenant.id },
    });
  }
  console.log('✅ Categories seeded');

  // ─── Warehouse ─────────────────────────────────────────
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'default-warehouse' },
    update: {},
    create: {
      id: 'default-warehouse',
      name: 'Main Warehouse',
      location: 'Kigali, Rwanda',
      isDefault: true,
      tenantId: defaultTenant.id,
    },
  });
  console.log('✅ Warehouse seeded');

  // ─── Products ──────────────────────────────────────────
  const products = [
    { name: 'Smartphone X', sku: 'PRD-000001', unitPrice: 350000, costPrice: 280000, categoryName: 'Electronics', unitSymbol: 'pc' },
    { name: 'Laptop Pro', sku: 'PRD-000002', unitPrice: 1200000, costPrice: 950000, categoryName: 'Electronics', unitSymbol: 'pc' },
    { name: 'T-Shirt (White)', sku: 'PRD-000003', unitPrice: 15000, costPrice: 8000, categoryName: 'Clothing', unitSymbol: 'pc' },
    { name: 'Rice (5kg)', sku: 'PRD-000004', unitPrice: 12000, costPrice: 9000, categoryName: 'Food & Beverage', unitSymbol: 'kg' },
    { name: 'Hammer', sku: 'PRD-000005', unitPrice: 5000, costPrice: 3000, categoryName: 'Hardware', unitSymbol: 'pc' },
  ];
  for (const prod of products) {
    const category = await prisma.category.findFirst({ where: { name: prod.categoryName, tenantId: defaultTenant.id } });
    const unit = await prisma.unitOfMeasure.findFirst({ where: { symbol: prod.unitSymbol, tenantId: defaultTenant.id } });
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        name: prod.name,
        sku: prod.sku,
        unitPrice: prod.unitPrice,
        costPrice: prod.costPrice,
        tenantId: defaultTenant.id,
        categoryId: category?.id || null,
        unitOfMeasureId: unit?.id || null,
        warehouseStocks: {
          create: {
            warehouseId: warehouse.id,
            quantity: Math.floor(Math.random() * 50) + 10,
            reserved: 0,
          },
        },
      },
    });
  }
  console.log('✅ Products seeded');

  // ─── Customers ──────────────────────────────────────────
  const customers = [
    { name: 'Jean Paul Niyonzima', companyName: 'Niyonzima Trading', phone: '0788123456', email: 'jean@example.com', address: 'Kigali, Rwanda' },
    { name: 'Grace Uwimana', companyName: 'Uwimana Stores', phone: '0788567890', email: 'grace@example.com', address: 'Musanze, Rwanda' },
    { name: 'David Mugabo', companyName: 'Mugabo Hardware', phone: '0788234567', email: 'david@example.com', address: 'Huye, Rwanda' },
  ];
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: `cust_${c.email}` },
      update: {},
      create: { ...c, tenantId: defaultTenant.id },
    });
  }
  console.log('✅ Customers seeded');

  // ─── Suppliers ──────────────────────────────────────────
  const suppliers = [
    { name: 'Rwanda Wholesalers Ltd', phone: '0788345678', email: 'info@rwandawholesalers.com', address: 'Kigali, Rwanda' },
    { name: 'East African Distributors', phone: '0788456789', email: 'info@eadistributors.com', address: 'Kigali, Rwanda' },
    { name: 'Local Foods Ltd', phone: '0788567890', email: 'info@localfoods.rw', address: 'Nyamata, Rwanda' },
  ];
  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { id: `supp_${s.email}` },
      update: {},
      create: { ...s, tenantId: defaultTenant.id },
    });
  }
  console.log('✅ Suppliers seeded');

  // ─── Quotations (idempotent with upsert) ──────────────
  const quotations = [
    {
      customerEmail: 'jean@example.com',
      items: [
        { productSku: 'PRD-000001', qty: 2, price: 350000 },
        { productSku: 'PRD-000003', qty: 10, price: 15000 },
      ],
    },
    {
      customerEmail: 'grace@example.com',
      items: [
        { productSku: 'PRD-000002', qty: 1, price: 1200000 },
        { productSku: 'PRD-000005', qty: 5, price: 5000 },
      ],
    },
  ];

  for (const q of quotations) {
    const customer = await prisma.customer.findFirst({ where: { email: q.customerEmail, tenantId: defaultTenant.id } });
    if (!customer) continue;
    const total = q.items.reduce((s, i) => s + i.qty * i.price, 0);
    const tax = total * 0.18;
    const number = `QTN-${String(quotations.indexOf(q) + 1).padStart(6, '0')}`;
    // Upsert by unique number
    const existing = await prisma.quotation.findUnique({ where: { number } });
    if (existing) {
      // Update existing: delete items and recreate? Or skip? For simplicity, we'll skip if exists.
      console.log(`Quotation ${number} already exists, skipping.`);
      continue;
    }
    await prisma.quotation.create({
      data: {
        tenantId: defaultTenant.id,
        number,
        customerId: customer.id,
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'DRAFT',
        total,
        tax,
        createdBy: defaultUser.id,
        items: {
          create: q.items.map(item => ({
            product: { connect: { sku: item.productSku } },
            quantity: item.qty,
            unitPrice: item.price,
            total: item.qty * item.price,
          })),
        },
      },
    });
  }
  console.log('✅ Quotations seeded');

  // ─── Purchase Orders (idempotent) ─────────────────────
  const purchaseOrders = [
    {
      supplierName: 'Rwanda Wholesalers Ltd',
      items: [
        { productSku: 'PRD-000001', qty: 10, cost: 250000 },
        { productSku: 'PRD-000005', qty: 50, cost: 3000 },
      ],
    },
  ];
  for (const po of purchaseOrders) {
    const supplier = await prisma.supplier.findFirst({ where: { name: po.supplierName, tenantId: defaultTenant.id } });
    if (!supplier) continue;
    const total = po.items.reduce((s, i) => s + i.qty * i.cost, 0);
    const tax = total * 0.18;
    const number = `PO-${String(purchaseOrders.indexOf(po) + 1).padStart(6, '0')}`;
    const existing = await prisma.purchaseOrder.findUnique({ where: { number } });
    if (existing) {
      console.log(`Purchase Order ${number} already exists, skipping.`);
      continue;
    }
    await prisma.purchaseOrder.create({
      data: {
        tenantId: defaultTenant.id,
        number,
        supplierId: supplier.id,
        orderDate: new Date(),
        status: 'DRAFT',
        total,
        tax,
        createdBy: defaultUser.id,
        items: {
          create: po.items.map(item => ({
            product: { connect: { sku: item.productSku } },
            quantity: item.qty,
            unitCost: item.cost,
            total: item.qty * item.cost,
          })),
        },
      },
    });
  }
  console.log('✅ Purchase Orders seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => console.error('❌ Seed failed:', e))
  .finally(() => prisma.$disconnect());
  
// import 'dotenv/config';
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import * as bcrypt from 'bcrypt';

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log('🌱 Seeding database...');

//   // 1. Roles
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

//   // 2. Dummy User
//   const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' } });
//   if (!ownerRole) throw new Error('Owner role not found');

//   const defaultTenant = await prisma.tenant.upsert({
//     where: { subdomain: 'demo' },
//     update: {},
//     create: {
//       name: 'Demo Company',
//       subdomain: 'demo',
//       email: 'admin@example.com',
//     },
//   });

//   const hashedPassword = await bcrypt.hash('password123', 10);
//   const defaultUser = await prisma.user.upsert({
//     where: { email: 'admin@example.com' },
//     update: {},
//     create: {
//       email: 'admin@example.com',
//       firstName: 'Admin',
//       lastName: 'User',
//       passwordHash: hashedPassword,
//       isActive: true,
//     },
//   });

//   await prisma.userTenant.upsert({
//     where: {
//       userId_tenantId: {
//         userId: defaultUser.id,
//         tenantId: defaultTenant.id,
//       },
//     },
//     update: {},
//     create: {
//       userId: defaultUser.id,
//       tenantId: defaultTenant.id,
//       roleId: ownerRole.id,
//       assignedBy: defaultUser.id,
//     },
//   });

//   console.log('✅ Dummy user created: admin@example.com / password123');

//   // ─── Units of Measure ──────────────────────────────────
//   const units = [
//     { name: 'Piece', symbol: 'pc' },
//     { name: 'Kilogram', symbol: 'kg' },
//     { name: 'Gram', symbol: 'g' },
//     { name: 'Liter', symbol: 'L' },
//     { name: 'Meter', symbol: 'm' },
//     { name: 'Box', symbol: 'bx' },
//   ];

//   for (const unit of units) {
//     await prisma.unitOfMeasure.upsert({
//       where: { id: `unit_${unit.symbol}` }, // or use a composite unique if you have one
//       update: {},
//       create: {
//         ...unit,
//         tenantId: defaultTenant.id,
//       },
//     });
//   }
//   console.log('✅ Units of measure seeded');

//   // ─── Categories ──────────────────────────────────────
//   const categories = [
//     { name: 'Electronics', description: 'Phones, laptops, accessories' },
//     { name: 'Clothing', description: 'Apparel and fashion' },
//     { name: 'Food & Beverage', description: 'Perishable and packaged goods' },
//     { name: 'Hardware', description: 'Tools, building materials' },
//   ];

//   for (const cat of categories) {
//     await prisma.category.upsert({
//       where: { id: `cat_${cat.name.toLowerCase()}` },
//       update: {},
//       create: {
//         ...cat,
//         tenantId: defaultTenant.id,
//       },
//     });
//   }
//   console.log('✅ Categories seeded');

//   // ─── Warehouse ──────────────────────────────────────
//   const warehouse = await prisma.warehouse.upsert({
//     where: { id: 'default-warehouse' },
//     update: {},
//     create: {
//       id: 'default-warehouse',
//       name: 'Main Warehouse',
//       location: 'Kigali, Rwanda',
//       isDefault: true,
//       tenantId: defaultTenant.id,
//     },
//   });
//   console.log('✅ Warehouse seeded');

//   // ─── Products ──────────────────────────────────────
//   const products = [
//     { name: 'Smartphone X', sku: 'PRD-000001', unitPrice: 350000, costPrice: 280000, categoryName: 'Electronics', unitSymbol: 'pc' },
//     { name: 'Laptop Pro', sku: 'PRD-000002', unitPrice: 1200000, costPrice: 950000, categoryName: 'Electronics', unitSymbol: 'pc' },
//     { name: 'T-Shirt (White)', sku: 'PRD-000003', unitPrice: 15000, costPrice: 8000, categoryName: 'Clothing', unitSymbol: 'pc' },
//     { name: 'Rice (5kg)', sku: 'PRD-000004', unitPrice: 12000, costPrice: 9000, categoryName: 'Food & Beverage', unitSymbol: 'kg' },
//     { name: 'Hammer', sku: 'PRD-000005', unitPrice: 5000, costPrice: 3000, categoryName: 'Hardware', unitSymbol: 'pc' },
//   ];

//   for (const prod of products) {
//     const category = await prisma.category.findFirst({ where: { name: prod.categoryName, tenantId: defaultTenant.id } });
//     const unit = await prisma.unitOfMeasure.findFirst({ where: { symbol: prod.unitSymbol, tenantId: defaultTenant.id } });
//     await prisma.product.upsert({
//       where: { sku: prod.sku },
//       update: {},
//       create: {
//         name: prod.name,
//         sku: prod.sku,
//         unitPrice: prod.unitPrice,
//         costPrice: prod.costPrice,
//         tenantId: defaultTenant.id,
//         categoryId: category?.id || null,
//         unitOfMeasureId: unit?.id || null,
//         warehouseStocks: {
//           create: {
//             warehouseId: warehouse.id,
//             quantity: Math.floor(Math.random() * 50) + 10,
//             reserved: 0,
//           },
//         },
//       },
//     });
//   }
//   console.log('✅ Products seeded');
  
//   console.log('🎉 Seeding complete!');
// }

// main()
//   .catch((e) => console.error('❌ Seed failed:', e))
//   .finally(() => prisma.$disconnect());