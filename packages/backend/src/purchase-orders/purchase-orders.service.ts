import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.purchaseOrder.count({ where: { tenantId } });
    return `PO-${String(count + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, dto: CreatePurchaseOrderDto) {
    const number = await this.generateNumber(tenantId);
    const total = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitCost - (item.discount || 0)), 0);
    const tax = total * 0.18; // configurable later

    return this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        number,
        supplierId: dto.supplierId,
        orderDate: dto.orderDate || new Date(),
        expectedDelivery: dto.expectedDelivery,
        status: 'DRAFT',
        total,
        tax,
        discount: dto.discount || 0,
        discountType: dto.discountType,
        notes: dto.notes,
        createdBy: userId,
        items: {
          create: dto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            discount: item.discount || 0,
            taxRate: item.taxRate || 0,
            total: item.quantity * item.unitCost - (item.discount || 0),
            notes: item.notes,
          })),
        },
      },
      include: { items: { include: { product: true } }, supplier: true },
    });
  }

  async findAllPaginated(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          supplier: { select: { id: true, name: true } },
          total: true,
          status: true,
          orderDate: true,
          expectedDelivery: true,
          createdAt: true,
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        goodsReceipts: true,
      },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');
    return po;
  }

  async update(tenantId: string, id: string, dto: UpdatePurchaseOrderDto) {
    // For simplicity, we update only header; you can recalc items separately
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: dto.supplierId,
        orderDate: dto.orderDate,
        expectedDelivery: dto.expectedDelivery,
        status: dto.status,
        discount: dto.discount,
        discountType: dto.discountType,
        notes: dto.notes,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}