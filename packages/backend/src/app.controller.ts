import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'Ubucuruzi ERP API',
      timestamp: new Date().toISOString(),
    };
  }
}