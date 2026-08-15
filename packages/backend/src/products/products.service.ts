import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    // Auto-generate SKU if not provided
    if (!dto.sku) {
      const count = await this.prisma.product.count({ where: { tenantId } });
      dto.sku = `PRD-${String(count + 1).padStart(6, '0')}`;
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        category: true,
        unit: true,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      include: {
        category: true,
        unit: true,
        warehouseStocks: {
          include: { warehouse: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        unit: true,
        warehouseStocks: {
          include: { warehouse: true },
        },
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { warehouse: true },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        unit: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Stock Management ──────────────────────────────────
  async getStock(tenantId: string, productId: string) {
    const stocks = await this.prisma.warehouseStock.findMany({
      where: {
        productId,
        warehouse: { tenantId },
      },
      include: { warehouse: true },
    });
    return stocks;
  }

  async adjustStock(
    tenantId: string,
    productId: string,
    warehouseId: string,
    quantity: number,
    notes: string,
    userId: string,
  ) {
    // Update stock
    const stock = await this.prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId_batchNumber: {
          warehouseId,
          productId,
          batchNumber: '',
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        warehouseId,
        productId,
        quantity,
        batchNumber: '',
      },
    });

    // Record movement
    await this.prisma.stockMovement.create({
      data: {
        tenantId,
        productId,
        warehouseId,
        quantity,
        movementType: quantity > 0 ? 'IN' : 'OUT',
        notes,
        createdBy: userId,
      },
    });

    return stock;
  }
}