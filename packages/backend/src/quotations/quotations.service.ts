import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/create-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.quotation.count({ where: { tenantId } });
    return `QTN-${String(count + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, dto: CreateQuotationDto) {
    const number = await this.generateNumber(tenantId);
    const total = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.discount || 0)), 0);
    const tax = total * 0.18; // default 18% VAT; can be made configurable later

    return this.prisma.quotation.create({
      data: {
        tenantId,
        number,
        customerId: dto.customerId,
        issueDate: dto.issueDate || new Date(),
        validUntil: dto.validUntil,
        status: dto.status || 'DRAFT',
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
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            taxRate: item.taxRate || 0,
            total: item.quantity * item.unitPrice - (item.discount || 0),
            notes: item.notes,
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
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
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          customer: { select: { id: true, name: true } },
          total: true,
          status: true,
          issueDate: true,
          validUntil: true,
          createdAt: true,
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async update(tenantId: string, id: string, dto: UpdateQuotationDto) {
    // Recalculate totals if items change (simplified: we'll only update header)
    return this.prisma.quotation.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        issueDate: dto.issueDate,
        validUntil: dto.validUntil,
        status: dto.status,
        discount: dto.discount,
        discountType: dto.discountType,
        notes: dto.notes,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.quotation.delete({ where: { id } });
  }
}