import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Req() req: any) {
    return this.dashboardService.getStats(req.user.tenantId);
  }

  @Get('revenue-trend')
  getRevenueTrend(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const start = from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const end = to ? new Date(to) : new Date();
    return this.dashboardService.getRevenueTrend(req.user.tenantId, start, end);
  }

  @Get('top-products')
  getTopProducts(@Req() req: any, @Query('limit') limit?: string) {
    return this.dashboardService.getTopProducts(req.user.tenantId, limit ? parseInt(limit, 10) : 5);
  }

  @Get('sales-status')
  getSalesByStatus(@Req() req: any) {
    return this.dashboardService.getSalesByStatus(req.user.tenantId);
  }
}

// import { Controller, Get, UseGuards, Req } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { DashboardService } from './dashboard.service';

// @Controller('dashboard')
// @UseGuards(AuthGuard('jwt'))
// export class DashboardController {
//   constructor(private dashboardService: DashboardService) {}

//   @Get('stats')
//   getStats(@Req() req: any) {
//     return this.dashboardService.getStats(req.user.tenantId);
//   }
// }