/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { SubjectService, SubjectResult } from './subject.service';

interface ResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  async getAllSubjects(): Promise<ResponseData<SubjectResult[]>> {
    const subjects = await this.subjectService.findAllSubjects();
    return { success: true, message: 'Lấy danh sách Môn học thành công', data: subjects };
  }

  @Post()
  async createSubject(@Body() subjectData: any) {
    const result = await this.subjectService.createSubject(subjectData);
    if (result instanceof Error) {
      // Nếu service trả về lỗi (trùng mã)
      return { success: false, message: result.message };
    }
    return { success: true, message: 'Thêm môn học thành công', data: result };
  }


@Put('by-code/:maHocPhan')
  async updateSubject(
    @Param('maHocPhan') maHocPhan: string,
    @Body() subjectData: any
  ) {
    // Loại bỏ _id nếu vô tình có
    if ('_id' in subjectData) delete subjectData._id;

    const result = await this.subjectService.updateSubject(maHocPhan, subjectData);
    return { success: true, message: 'Cập nhật môn học thành công', data: result };
  }


  @Delete(':maHocPhan')
  async deleteSubject(@Param('maHocPhan') maHocPhan: string) {
    await this.subjectService.deleteSubject(maHocPhan);
    return { success: true, message: `Xóa môn học ${maHocPhan} thành công` };
  }
}
