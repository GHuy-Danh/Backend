import { Controller, Get, Param } from '@nestjs/common';
import { BuoiHocService } from './buoi_hoc.service';

@Controller('buoi-hoc') 
export class BuoiHocController {
  constructor(private readonly buoiService: BuoiHocService) {}

  @Get()
  async getAll() {
    const data = await this.buoiService.findAll();
    return { success: true, message: 'Lấy danh sách buổi học', data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.buoiService.findById(id);
    return { success: true, data };
  }
}
