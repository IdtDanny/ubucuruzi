import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    return `INV-${String(count + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one invoice item is required');
    }

    const number = await this.generateNumber(tenantId);
    const total = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.discount || 0)), 0);
    const tax = total * 0.18; // 18% VAT – can be made configurable later

    return this.prisma.invoice.create({
      data: {
        tenantId,
        number,
        customerId: dto.customerId,
        issueDate: dto.issueDate || new Date(),
        dueDate: dto.dueDate,
        status: dto.status || 'DRAFT',
        paymentStatus: 'UNPAID',
        invoiceType: dto.invoiceType || 'TAX_INVOICE',
        total,
        tax,
        discount: dto.discount || 0,
        discountType: dto.discountType,
        notes: dto.notes,
        createdBy: userId,
        quotationId: dto.quotationId || undefined,
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
      this.prisma.invoice.findMany({
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
          paymentStatus: true,
          issueDate: true,
          dueDate: true,
          createdAt: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        quotation: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(tenantId: string, id: string, dto: UpdateInvoiceDto) {
    await this.findOne(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        issueDate: dto.issueDate,
        dueDate: dto.dueDate,
        status: dto.status,
        paymentStatus: dto.paymentStatus,
        invoiceType: dto.invoiceType,
        discount: dto.discount,
        discountType: dto.discountType,
        notes: dto.notes,
        quotationId: dto.quotationId,
        // Note: items are not updated via this method; you'd need separate endpoints for items.
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.invoice.delete({ where: { id } });
  }
}