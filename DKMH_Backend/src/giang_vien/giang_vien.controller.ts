import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GiangVienService } from './giang_vien.service';

@Controller('teachers') // /api/teachers (nếu globalPrefix 'api' được bật sẽ là /api/teachers)
export class GiangVienController {
  constructor(private readonly gvService: GiangVienService) {}

  @Get()
  async getAll(@Query('nganh') nganh?: string) {
    if (nganh) {
      const data = await this.gvService.findByNganh(nganh);
      return { success: true, message: 'Lấy giảng viên theo ngành', data };
    }
    const data = await this.gvService.findAll();
    return { success: true, message: 'Lấy danh sách giảng viên', data };
  }

  @Get(':ma_gv')
  async getOne(@Param('ma_gv') ma_gv: string) {
    const data = await this.gvService.findById(ma_gv);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.gvService.create(body);
    return { success: true, message: 'Thêm giảng viên thành công', data };
  }

  @Put(':ma_gv')
  async update(@Param('ma_gv') ma_gv: string, @Body() body: any) {
    const data = await this.gvService.update(ma_gv, body);
    return { success: true, message: 'Cập nhật thành công', data };
  }

  @Delete(':ma_gv')
  async delete(@Param('ma_gv') ma_gv: string) {
    await this.gvService.delete(ma_gv);
    return { success: true, message: 'Xóa giảng viên thành công' };
  }
}
