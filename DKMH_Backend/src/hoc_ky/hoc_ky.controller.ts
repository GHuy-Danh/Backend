import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HocKyService } from './hoc_ky.service';

@Controller('hoc-ky')
export class HocKyController {
  constructor(private readonly hocKyService: HocKyService) {}

  @Get()
  async findAll() {
    const data = await this.hocKyService.findAll();
    return { success: true, message: 'Lấy danh sách học kỳ', data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.hocKyService.findById(id);
    return { success: true, data };
  }
}
