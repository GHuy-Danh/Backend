// D:\Tai lieu hoc\DoAnTotNghiep\DKMH_Backend\src\thoi_khoa_bieu\thoi_khoa_bieu.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThoiKhoaBieuController } from './thoi_khoa_bieu.controller';
import { ThoiKhoaBieuService } from './thoi_khoa_bieu.service';
import { ThoiKhoaBieu, ThoiKhoaBieuSchema } from './thoi_khoa_bieu.schema'; 
import { LopHocPhan, LopHocPhanSchema } from '../lop_hoc_phan/lop_hoc_phan.schema';
import { DangKy, DangKySchema } from '../dang_ky/dang_ky.schema';
import { GiangVien, GiangVienSchema } from '../giang_vien/giang_vien.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      // Chỉ cần khai báo các document chính
      { name: ThoiKhoaBieu.name, schema: ThoiKhoaBieuSchema, collection:'thoi_khoa_bieu' },
      { name: LopHocPhan.name, schema: LopHocPhanSchema, collection:'lop_hoc_phan' },
      { name: DangKy.name, schema: DangKySchema, collection:'dang_ky' },
      { name: GiangVien.name, schema: GiangVienSchema, collection: 'giang_vien' },
    ]),
  ],
  controllers: [ThoiKhoaBieuController],
  providers: [ThoiKhoaBieuService],
})
export class ThoiKhoaBieuModule {}