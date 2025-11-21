import { Controller, Get, Query } from '@nestjs/common';
import { ThongKeService } from './thong_ke.service';

@Controller('statistics')
export class ThongKeController {
  constructor(private readonly service: ThongKeService) {}

  @Get('dashboard')
  async getDashboard(@Query('hocKy') hocKy: string) {
    const hk = Number(hocKy) || 1;
    const data = await this.service.getDashboardStats(hk);
    return { success: true, data };
  }

  @Get('top-subjects')
  async getTopSubjects(@Query('hocKy') hocKy: string) {
    const hk = Number(hocKy) || 1;
    const data = await this.service.getTopSubjects(hk);
    return { success: true, data };
  }
}