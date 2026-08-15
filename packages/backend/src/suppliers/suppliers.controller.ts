import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (page && limit) {
      return this.suppliersService.findAllPaginated(
        req.user.tenantId,
        parseInt(page, 10),
        parseInt(limit, 10),
        search,
      );
    }
    return this.suppliersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.suppliersService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.suppliersService.remove(req.user.tenantId, id);
  }
}