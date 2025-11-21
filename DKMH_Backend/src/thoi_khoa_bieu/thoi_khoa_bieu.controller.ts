import { Controller, Get, Post, Put, Query, Body } from '@nestjs/common';
import { ThoiKhoaBieuService } from './thoi_khoa_bieu.service';

@Controller('thoi-khoa-bieu')
export class ThoiKhoaBieuController {
  constructor(private readonly service: ThoiKhoaBieuService) {}

  // @Get()
  // async getRoot(@Query('hocKy') hocKy: string) {
  //     // Có thể tái sử dụng logic getAll (vì nó lấy tất cả lịch của Admin)
  //     const data = await this.service.getAll(Number(hocKy) || 1); // Mặc định HK 1 nếu không có query
  //     return { success: true, message: 'Danh sách lịch học cơ bản', data };
  //   }

  @Get('admin')
  async getAllAdminSchedule(@Query('hocKy') hocKy: string) {
    // Gọi hàm getAll trong Service (chúng ta đã thêm nó ở bước trước)
    const data = await this.service.getAll(Number(hocKy));
    return { success: true, data };
  }

  // Tạo lịch (khi bấm nút ở Admin Timetable)
  @Post('generate')
  async generate(@Body() body: { hocKy: number }) {
    return await this.service.generateFromLopHocPhan(Number(body.hocKy));
  }

  // Lấy lịch sinh viên
  @Get('student')
  async getStudentSchedule(@Query('ma_sv') ma_sv: string, @Query('hocKy') hocKy: string) {
    const data = await this.service.getScheduleByStudent(ma_sv, Number(hocKy));
    return { success: true, data };
  }

  // Lấy lịch giảng viên
  @Get('lecturer')
  async getLecturerSchedule(@Query('ma_gv') ma_gv: string, @Query('hocKy') hocKy: string) {
    const data = await this.service.getScheduleByLecturer(ma_gv, Number(hocKy));
    return { success: true, data };
  }

  // Admin cập nhật trạng thái buổi học
  @Put('update-status')
  async updateStatus(@Body() body: { ma_lop_hp: string, ngay_hoc: string, trang_thai: string }) {
    return await this.service.updateSessionStatus(body.ma_lop_hp, body.ngay_hoc, body.trang_thai);
  }
}