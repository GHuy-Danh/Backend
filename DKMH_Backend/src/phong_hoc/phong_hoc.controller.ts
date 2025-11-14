import { Controller, Get, Param } from '@nestjs/common';
import { PhongHocService } from './phong_hoc.service';

@Controller('phong-hoc')
export class PhongHocController {
  constructor(private readonly phongService: PhongHocService) {}

  @Get()
  async findAll() {
    const data = await this.phongService.findAll();
    return { success: true, message: 'Lấy danh sách phòng học', data };
  }

  @Get(':ma_phong')
  async findOne(@Param('id') id: string) {
    const data = await this.phongService.findById(id);
    return { success: true, message: `Chi tiết phòng ${id}`, data };
  }
}
