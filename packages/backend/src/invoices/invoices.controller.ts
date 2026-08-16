import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.tenantId, req.user.userId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.invoicesService.findAllPaginated(
      req.user.tenantId,
      parseInt(page ?? '1', 10),
      parseInt(limit ?? '10', 10),
      search,
      status,
    );
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.remove(req.user.tenantId, id);
  }
}