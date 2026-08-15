import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const [products, customers, lowStock] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.warehouseStock.count({
        where: {
          warehouse: { tenantId },
          quantity: { lt: 5 },
          product: { isActive: true },
        },
      }),
    ]);

    return {
      totalProducts: products,
      totalCustomers: customers,
      totalRevenue: 0,
      totalOrders: 0,
      lowStockItems: lowStock,
    };
  }
}