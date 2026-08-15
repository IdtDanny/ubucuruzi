import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('roles')
export class RolesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.prisma.role.findMany();
  }
}