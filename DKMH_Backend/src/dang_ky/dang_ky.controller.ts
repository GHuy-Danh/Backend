import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DangKyService } from './dang_ky.service';

@Controller('dang-ky')
export class DangKyController {
  constructor(private readonly dangKyService: DangKyService) {}

  @Post()
  async create(@Body() body: any) {
    const doc = await this.dangKyService.create(body);
    return { success: true, message: 'Tạo đăng ký thành công', data: doc };
  }

  @Get()
  async findAll(@Query('ma_sv') ma_sv?: string, @Query('ma_lop_hp') ma_lop_hp?: string) {
    if (ma_sv) {
      const data = await this.dangKyService.findByStudent(ma_sv);
      return { success: true, message: 'Lấy danh sách đăng ký theo sinh viên', data };
    }
    if (ma_lop_hp) {
      const data = await this.dangKyService.findByClass(ma_lop_hp);
      return { success: true, message: 'Lấy danh sách đăng ký theo lớp học phần', data };
    }
    const data = await this.dangKyService.findAll();
    return { success: true, message: 'Lấy danh sách đăng ký', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.dangKyService.findById(id);
    return { success: true, message: `Lấy đăng ký ${id}`, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.dangKyService.update(id, body);
    return { success: true, message: `Cập nhật đăng ký ${id}`, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.dangKyService.delete(id);
    return { success: true, message: `Xóa đăng ký ${id} thành công` };
  }
}
