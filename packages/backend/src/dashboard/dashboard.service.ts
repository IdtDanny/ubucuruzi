import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const [products, lowStock] = await Promise.all([
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.warehouseStock.count({
        where: {
          warehouse: { tenantId },
          quantity: { lt: 5 },
          product: { isActive: true },
        },
      }),
    ]);

    // Placeholder for other stats until models are created
    return {
      totalProducts: products,
      totalCustomers: 0,
      totalRevenue: 0,
      totalOrders: 0,
      lowStockItems: lowStock,
    };
  }
}