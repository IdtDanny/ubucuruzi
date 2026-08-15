import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ─── Create ──────────────────────────────────────────────
  async create(tenantId: string, dto: CreateProductDto) {
    if (!dto.sku) {
      const count = await this.prisma.product.count({ where: { tenantId } });
      dto.sku = `PRD-${String(count + 1).padStart(6, '0')}`;
    }
    return this.prisma.product.create({
      data: { ...dto, tenantId },
      include: { category: true, unit: true },
    });
  }

  // ─── Find All (without pagination) ──────────────────────
  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: {
        category: true,
        unit: true,
        warehouseStocks: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Paginated Search ────────────────────────────────────
  // async findAllPaginated(
  //   tenantId: string,
  //   page: number = 1,
  //   limit: number = 10,
  //   search?: string,
  //   categoryId?: string,
  // ) {
  //   const skip = (page - 1) * limit;
  //   const where: any = { tenantId, isActive: true };

  //   if (categoryId) where.categoryId = categoryId;

  //   if (search) {
  //     where.OR = [
  //       { name: { contains: search, mode: 'insensitive' } },
  //       { sku: { contains: search, mode: 'insensitive' } },
  //       { barcode: { contains: search, mode: 'insensitive' } },
  //     ];
  //   }

  //   const [data, total] = await Promise.all([
  //     this.prisma.product.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy: { createdAt: 'desc' },
  //       include: {
  //         category: true,
  //         unit: true,
  //         warehouseStocks: { include: { warehouse: true } },
  //       },
  //     }),
  //     this.prisma.product.count({ where }),
  //   ]);

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }

  async findAllPaginated(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // ── SELECT only needed fields ──
    const selectFields = {
      id: true,
      sku: true,
      name: true,
      unitPrice: true,
      costPrice: true,
      isActive: true,
      category: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, symbol: true } },
      warehouseStocks: {
        select: { quantity: true },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: selectFields,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Compute total stock on the fly
    const dataWithStock = data.map(p => ({
      ...p,
      totalStock: p.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0),
    }));

    return {
      data: dataWithStock,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Find One ────────────────────────────────────────────
  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        unit: true,
        warehouseStocks: { include: { warehouse: true } },
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

  // ─── Update ──────────────────────────────────────────────
  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, unit: true },
    });
  }

  // ─── Soft Delete ─────────────────────────────────────────
  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Export CSV ──────────────────────────────────────────
  async exportCSV(tenantId: string) {
    const products = await this.findAll(tenantId);
    const fields = ['sku', 'name', 'category', 'unitPrice', 'costPrice', 'stock'];
    const rows = products.map(p => ({
      sku: p.sku,
      name: p.name,
      category: p.category?.name || '',
      unitPrice: p.unitPrice,
      costPrice: p.costPrice,
      stock: p.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0),
    }));
    return { fields, rows };
  }

  // ─── Export Excel ────────────────────────────────────────
  async exportExcel(tenantId: string) {
    const products = await this.findAll(tenantId);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Cost Price', key: 'costPrice', width: 15 },
      { header: 'Stock', key: 'stock', width: 15 },
    ];
    products.forEach(p => {
      const stock = p.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);
      worksheet.addRow({
        sku: p.sku,
        name: p.name,
        category: p.category?.name || '',
        unitPrice: p.unitPrice,
        costPrice: p.costPrice,
        stock,
      });
    });
    return workbook;
  }

  // ─── Import from CSV/Excel ──────────────────────────────
  // async importProducts(tenantId: string, rows: any[]) {
  //   const results = [];
  //   for (const row of rows) {
  //     let category = null;
  //     if (row.category) {
  //       category = await this.prisma.category.findFirst({
  //         where: { name: row.category, tenantId },
  //       });
  //     }
  //     const data = {
  //       sku: row.sku,
  //       name: row.name,
  //       unitPrice: parseFloat(row.unitPrice) || 0,
  //       costPrice: parseFloat(row.costPrice) || 0,
  //       tenantId,
  //       categoryId: category?.id || null,
  //     };
  //     // Upsert by SKU if present
  //     const product = await this.prisma.product.upsert({
  //       where: { sku: data.sku || '' },
  //       update: data,
  //       create: data,
  //     });
  //     results.push(product);
  //   }
  //   return results;
  // }

  async importProducts(tenantId: string, rows: any[]) {
    const results = [];
    for (const row of rows) {
      let category = null;
      if (row.category) {
        category = await this.prisma.category.findFirst({
          where: { name: row.category, tenantId },
        });
      }
      const data = {
        sku: row.sku,
        name: row.name,
        unitPrice: parseFloat(row.unitPrice) || 0,
        costPrice: parseFloat(row.costPrice) || 0,
        tenantId,
        categoryId: category?.id || null,
      };
      const product = await this.prisma.product.upsert({
        where: { sku: data.sku || '' },
        update: data,
        create: data,
      });
      results.push(product);
    }
    return results;
  }

  // ─── Stock Management ────────────────────────────────────
  async getStock(tenantId: string, productId: string) {
    return this.prisma.warehouseStock.findMany({
      where: { productId, warehouse: { tenantId } },
      include: { warehouse: true },
    });
  }

  async adjustStock(
    tenantId: string,
    productId: string,
    warehouseId: string,
    quantity: number,
    notes: string,
    userId: string,
  ) {
    const stock = await this.prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId_batchNumber: {
          warehouseId,
          productId,
          batchNumber: '',
        },
      },
      update: { quantity: { increment: quantity } },
      create: { warehouseId, productId, quantity, batchNumber: '' },
    });

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

// import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

// @Injectable()
// export class ProductsService {
//   constructor(private prisma: PrismaService) {}

//   async create(tenantId: string, dto: CreateProductDto) {
//     // Auto-generate SKU if not provided
//     if (!dto.sku) {
//       const count = await this.prisma.product.count({ where: { tenantId } });
//       dto.sku = `PRD-${String(count + 1).padStart(6, '0')}`;
//     }

//     return this.prisma.product.create({
//       data: {
//         ...dto,
//         tenantId,
//       },
//       include: {
//         category: true,
//         unit: true,
//       },
//     });
//   }

//   async findAll(tenantId: string) {
//     return this.prisma.product.findMany({
//       where: { tenantId },
//       include: {
//         category: true,
//         unit: true,
//         warehouseStocks: {
//           include: { warehouse: true },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   async findOne(tenantId: string, id: string) {
//     const product = await this.prisma.product.findFirst({
//       where: { id, tenantId },
//       include: {
//         category: true,
//         unit: true,
//         warehouseStocks: {
//           include: { warehouse: true },
//         },
//         stockMovements: {
//           take: 10,
//           orderBy: { createdAt: 'desc' },
//           include: { warehouse: true },
//         },
//       },
//     });

//     if (!product) throw new NotFoundException('Product not found');
//     return product;
//   }

//   async update(tenantId: string, id: string, dto: UpdateProductDto) {
//     await this.findOne(tenantId, id);
//     return this.prisma.product.update({
//       where: { id },
//       data: dto,
//       include: {
//         category: true,
//         unit: true,
//       },
//     });
//   }

//   async remove(tenantId: string, id: string) {
//     await this.findOne(tenantId, id);
//     return this.prisma.product.update({
//       where: { id },
//       data: { isActive: false },
//     });
//   }

//   // ─── Stock Management ──────────────────────────────────
//   async getStock(tenantId: string, productId: string) {
//     const stocks = await this.prisma.warehouseStock.findMany({
//       where: {
//         productId,
//         warehouse: { tenantId },
//       },
//       include: { warehouse: true },
//     });
//     return stocks;
//   }

//   async adjustStock(
//     tenantId: string,
//     productId: string,
//     warehouseId: string,
//     quantity: number,
//     notes: string,
//     userId: string,
//   ) {
//     // Update stock
//     const stock = await this.prisma.warehouseStock.upsert({
//       where: {
//         warehouseId_productId_batchNumber: {
//           warehouseId,
//           productId,
//           batchNumber: '',
//         },
//       },
//       update: {
//         quantity: { increment: quantity },
//       },
//       create: {
//         warehouseId,
//         productId,
//         quantity,
//         batchNumber: '',
//       },
//     });

//     // Record movement
//     await this.prisma.stockMovement.create({
//       data: {
//         tenantId,
//         productId,
//         warehouseId,
//         quantity,
//         movementType: quantity > 0 ? 'IN' : 'OUT',
//         notes,
//         createdBy: userId,
//       },
//     });

//     return stock;
//   }

//   async findAllPaginated(
//     tenantId: string,
//     page: number = 1,
//     limit: number = 10,
//     search?: string,
//     categoryId?: string,
//   ) {
//     const skip = (page - 1) * limit;
//     const where: any = { tenantId };

//     if (categoryId) where.categoryId = categoryId;

//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: 'insensitive' } },
//         { sku: { contains: search, mode: 'insensitive' } },
//         { barcode: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     const [data, total] = await Promise.all([
//       this.prisma.product.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//         include: { category: true, unit: true, warehouseStocks: { include: { warehouse: true } } },
//       }),
//       this.prisma.product.count({ where }),
//     ]);

//     return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
//   }
// }