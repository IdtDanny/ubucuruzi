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

  // ─── Revenue Trend ────────────────────────────────────
  async getRevenueTrend(tenantId: string, from: Date, to: Date) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        issueDate: { gte: from, lte: to },
        paymentStatus: 'PAID',
      },
      select: { total: true, issueDate: true },
    });

    const grouped = invoices.reduce((acc, inv) => {
      const month = inv.issueDate.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + inv.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // ─── Top Products ─────────────────────────────────────
  async getTopProducts(tenantId: string, limit: number = 5) {
    const items = await this.prisma.invoiceItem.groupBy({
      by: ['productId'],
      where: { invoice: { tenantId, paymentStatus: 'PAID' } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const productIds = items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    return items.map(item => ({
      productName: products.find(p => p.id === item.productId)?.name || 'Unknown',
      quantity: item._sum.quantity || 0,
      total: item._sum.total || 0,
    }));
  }

  // ─── Sales by Status ─────────────────────────────────
  async getSalesByStatus(tenantId: string) {
    const statuses = await this.prisma.invoice.groupBy({
      by: ['paymentStatus'],
      where: { tenantId },
      _count: { id: true },
      _sum: { total: true },
    });
    return statuses.map(s => ({
      status: s.paymentStatus,
      count: s._count.id,
      total: s._sum.total || 0,
    }));
  }
}