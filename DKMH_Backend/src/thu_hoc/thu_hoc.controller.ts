import { Controller, Get, Param } from '@nestjs/common';
import { ThuHocService } from './thu_hoc.service';

@Controller('thu-hoc')
export class ThuHocController {
  constructor(private readonly thuService: ThuHocService) {}

  @Get()
  async findAll() {
    const data = await this.thuService.findAll();
    return { success: true, message: 'Lấy danh sách thứ học', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.thuService.findById(id);
    return { success: true, message: `Chi tiết thứ học ${id}`, data };
  }
}
