import { IsString, IsOptional, IsNumber, IsDate, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInvoiceDto {
  @IsString()
  customerId!: string;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @IsOptional()
  @IsString()
  invoiceType?: string; // TAX_INVOICE, PROFORMA, RECEIPT

  @IsOptional()
  @IsString()
  status?: string; // DRAFT, SENT, PAID, OVERDUE, CANCELLED

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  quotationId?: string; // optional link to quotation

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @IsOptional()
  @IsString()
  invoiceType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string; // ← ADD THIS LINE

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  quotationId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}