import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { ...dto, tenantId },
    });
  }

  // ─── Simple findAll (for export or list without pagination) ──
  async findAll(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        companyName: true,
        phone: true,
        email: true,
        address: true,
        tin: true,
        currentBalance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ─── Optimized paginated list ──────────────────────────────
  async findAllPaginated(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { tin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          companyName: true,
          phone: true,
          email: true,
          address: true,
          tin: true,
          currentBalance: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Single customer (minimal fields) ──────────────────────
  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        companyName: true,
        phone: true,
        email: true,
        address: true,
        tin: true,
        currentBalance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  // ─── Update ──────────────────────────────────────────────────
  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, phone: true },
    });
  }

  // ─── Delete ──────────────────────────────────────────────────
  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.delete({ where: { id } });
  }

  // ─── Placeholder for customer with relations (will be used later) ──
  async getCustomerWithRelations(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        quotations: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

// @Injectable()
// export class CustomersService {
//   constructor(private prisma: PrismaService) {}

//   async create(tenantId: string, dto: CreateCustomerDto) {
//     return this.prisma.customer.create({
//       data: { ...dto, tenantId },
//     });
//   }

//   async findAll(tenantId: string) {
//     return this.prisma.customer.findMany({
//       where: { tenantId },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   async findAllPaginated(
//     tenantId: string,
//     page: number = 1,
//     limit: number = 10,
//     search?: string,
//   ) {
//     const skip = (page - 1) * limit;
//     const where: any = { tenantId };

//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: 'insensitive' } },
//         { email: { contains: search, mode: 'insensitive' } },
//         { phone: { contains: search, mode: 'insensitive' } },
//         { tin: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     const [data, total] = await Promise.all([
//       this.prisma.customer.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.customer.count({ where }),
//     ]);

//     return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
//   }

//   async findOne(tenantId: string, id: string) {
//     const customer = await this.prisma.customer.findFirst({
//       where: { id, tenantId },
//     });
//     if (!customer) throw new NotFoundException('Customer not found');
//     return customer;
//   }

//   async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
//     await this.findOne(tenantId, id);
//     return this.prisma.customer.update({
//       where: { id },
//       data: dto,
//     });
//   }

//   async remove(tenantId: string, id: string) {
//     await this.findOne(tenantId, id);
//     return this.prisma.customer.delete({ where: { id } });
//   }
// }