import { Controller, Get,Post,Put,Delete,Body,Param,Query} from '@nestjs/common';
import { DangKyService } from './dang_ky.service';

@Controller('dang-ky')
export class DangKyController {
  constructor(private readonly service: DangKyService) {}

  @Post()
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { success: true, message: 'Tạo đăng ký thành công', data };
  }

  @Get()
  async findAll(
    @Query('ma_sv') ma_sv?: string,
    @Query('ma_lop_hp') ma_lop_hp?: string,
    @Query('hoc_ky') hoc_ky?: number,
  ) {
    if (ma_sv) {
      return {
        success: true,
        data: await this.service.findByStudent(ma_sv),
      };
    }
    if (ma_lop_hp) {
      return {
        success: true,
        data: await this.service.findByClass(ma_lop_hp),
      };
    }
    if (hoc_ky) {
      return {
        success: true,
        data: await this.service.findByHocKy(Number(hoc_ky)),
      };
    }
    return { success: true, data: await this.service.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.service.findById(id) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return {
      success: true,
      message: 'Cập nhật đăng ký thành công',
      data: await this.service.update(id, body),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, message: 'Xóa đăng ký thành công' };
  }
}
