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
  Res,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Parser } from 'json2csv';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    if (page && limit) {
      return this.productsService.findAllPaginated(
        req.user.tenantId,
        parseInt(page, 10),
        parseInt(limit, 10),
        search,
        categoryId,
      );
    }
    return this.productsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.productsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.productsService.remove(req.user.tenantId, id);
  }

  // ─── Export ──────────────────────────────────────────────
  @Get('export/csv')
  async exportCSV(@Req() req: any, @Res() res: Response) {
    const { fields, rows } = await this.productsService.exportCSV(req.user.tenantId);
    const json2csv = new Parser({ fields, defaultValue: '' });
    const csv = json2csv.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csv);
  }

  @Get('export/excel')
  async exportExcel(@Req() req: any, @Res() res: Response) {
    const workbook = await this.productsService.exportExcel(req.user.tenantId);
    const buffer = await workbook.xlsx.writeBuffer();
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('products.xlsx');
    return res.send(buffer);
  }

  // ─── Import ──────────────────────────────────────────────
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@Req() req: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const rows: any[] = [];

    if (file.mimetype === 'text/csv') {
      const stream = Readable.from(file.buffer);
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row: any) => rows.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new BadRequestException('No worksheet found in Excel file');

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const getString = (cell: any) => String(cell || '');
        rows.push({
          sku: getString(row.getCell(1).value),
          name: getString(row.getCell(2).value),
          category: getString(row.getCell(3).value),
          unitPrice: parseFloat(getString(row.getCell(4).value)) || 0,
          costPrice: parseFloat(getString(row.getCell(5).value)) || 0,
          stock: parseInt(getString(row.getCell(6).value), 10) || 0,
        });
      });
    } else {
      throw new BadRequestException('Unsupported file type. Upload CSV or Excel.');
    }

    const results = await this.productsService.importProducts(req.user.tenantId, rows);
    return { imported: results.length, products: results };
  }

  @Get(':id/stock')
  getStock(@Req() req: any, @Param('id') id: string) {
    return this.productsService.getStock(req.user.tenantId, id);
  }
}

// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
// import { AuthGuard } from '@nestjs/passport';
// import { Response } from 'express';
// import * as ExcelJS from 'exceljs';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UploadedFile, UseInterceptors } from '@nestjs/common';
// import * as csv from 'csv-parser';
// import { Readable } from 'stream';
// import { Parser } from 'json2csv';

// @Controller('products')
// @UseGuards(AuthGuard('jwt'))
// export class ProductsController {
//   constructor(private readonly productsService: ProductsService) {}

//   @Post()
//   create(@Req() req: any, @Body() dto: CreateProductDto) {
//     return this.productsService.create(req.user.tenantId, dto);
//   }

//   @Get()
//   findAll(@Req() req: any) {
//     return this.productsService.findAll(req.user.tenantId);
//   }

//   @Get(':id')
//   findOne(@Req() req: any, @Param('id') id: string) {
//     return this.productsService.findOne(req.user.tenantId, id);
//   }

//   @Patch(':id')
//   update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
//     return this.productsService.update(req.user.tenantId, id, dto);
//   }

//   @Delete(':id')
//   remove(@Req() req: any, @Param('id') id: string) {
//     return this.productsService.remove(req.user.tenantId, id);
//   }

//   @Get(':id/stock')
//   getStock(@Req() req: any, @Param('id') id: string) {
//     return this.productsService.getStock(req.user.tenantId, id);
//   }

//   @Get('export/csv')
//   async exportCSV(@Req() req: any, @Res() res: Response) {
//     const products = await this.productsService.findAll(req.user.tenantId);
//     const fields = ['sku', 'name', 'category.name', 'unitPrice', 'costPrice', 'stock'];
//     const json2csv = new Parser({ fields, defaultValue: '' });
//     const csv = json2csv.parse(products);
//     res.header('Content-Type', 'text/csv');
//     res.attachment('products.csv');
//     return res.send(csv);
//   }

//   @Get('export/excel')
//   async exportExcel(@Req() req: any, @Res() res: Response) {
//     const products = await this.productsService.findAll(req.user.tenantId);
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Products');
//     worksheet.columns = [
//       { header: 'SKU', key: 'sku', width: 15 },
//       { header: 'Name', key: 'name', width: 30 },
//       { header: 'Category', key: 'category', width: 20 },
//       { header: 'Unit Price', key: 'unitPrice', width: 15 },
//       { header: 'Cost Price', key: 'costPrice', width: 15 },
//       { header: 'Stock', key: 'stock', width: 15 },
//     ];
//     products.forEach(p => {
//       const stock = p.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);
//       worksheet.addRow({
//         sku: p.sku,
//         name: p.name,
//         category: p.category?.name || '',
//         unitPrice: p.unitPrice,
//         costPrice: p.costPrice,
//         stock,
//       });
//     });
//     const buffer = await workbook.xlsx.writeBuffer();
//     res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.attachment('products.xlsx');
//     return res.send(buffer);
//   }

//   // Import
//   @Post('import')
//   @UseInterceptors(FileInterceptor('file'))
//   async importProducts(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
//     const tenantId = req.user.tenantId;
//     const products = [];

//     if (file.mimetype === 'text/csv') {
//       const stream = Readable.from(file.buffer);
//       await new Promise((resolve, reject) => {
//         stream
//           .pipe(csv())
//           .on('data', (row) => products.push(row))
//           .on('end', resolve)
//           .on('error', reject);
//       });
//     } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.load(file.buffer);
//       const worksheet = workbook.getWorksheet(1);
//       worksheet.eachRow((row, rowNumber) => {
//         if (rowNumber === 1) return; // skip header
//         products.push({
//           sku: row.getCell(1).value,
//           name: row.getCell(2).value,
//           category: row.getCell(3).value,
//           unitPrice: row.getCell(4).value,
//           costPrice: row.getCell(5).value,
//           stock: row.getCell(6).value,
//         });
//       });
//     } else {
//       throw new BadRequestException('Unsupported file type. Upload CSV or Excel.');
//     }

//     // Process each product (create or update)
//     const results = [];
//     for (const p of products) {
//       // find category by name
//       let category = null;
//       if (p.category) {
//         category = await this.prisma.category.findFirst({ where: { name: p.category, tenantId } });
//       }
//       const data = {
//         sku: p.sku,
//         name: p.name,
//         unitPrice: parseFloat(p.unitPrice) || 0,
//         costPrice: parseFloat(p.costPrice) || 0,
//         tenantId,
//         categoryId: category?.id || null,
//       };
//       const product = await this.prisma.product.upsert({
//         where: { sku: data.sku || undefined },
//         update: data,
//         create: data,
//       });
//       results.push(product);
//     }

//     return { imported: results.length, products: results };
//   }
// }