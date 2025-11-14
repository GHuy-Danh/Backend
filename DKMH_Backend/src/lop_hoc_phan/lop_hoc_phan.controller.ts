import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LopHocPhanService } from './lop_hoc_phan.service';

@Controller('lop-hoc-phan')
export class LopHocPhanController {
  constructor(private readonly lhpService: LopHocPhanService) {}

  @Post()
  async create(@Body() body: any) {
    const doc = await this.lhpService.create(body);
    return { success: true, message: 'Tạo lớp học phần thành công', data: doc };
  }

  @Get()
  async findAll(@Query('ma_mon') ma_mon?: string, @Query('ma_gv') ma_gv?: string) {
    if (ma_mon) {
      const data = await this.lhpService.findByMon(ma_mon);
      return { success: true, message: 'Lấy lớp theo mã môn', data };
    }
    if (ma_gv) {
      const data = await this.lhpService.findByGiangVien(ma_gv);
      return { success: true, message: 'Lấy lớp theo giảng viên', data };
    }
    const data = await this.lhpService.findAll();
    return { success: true, message: 'Lấy danh sách lớp học phần', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.lhpService.findById(id);
    return { success: true, message: `Lấy lớp ${id}`, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.lhpService.update(id, body);
    return { success: true, message: `Cập nhật lớp ${id}`, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.lhpService.delete(id);
    return { success: true, message: `Xóa lớp ${id} thành công` };
  }
}
