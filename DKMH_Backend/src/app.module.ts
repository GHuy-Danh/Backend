/* eslint-disable no-irregular-whitespace */
/* eslint-disable prettier/prettier */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SubjectModule } from './subject/subject.module';
import { NhatKyHeThongModule } from './nhatkyhethong/nhatkyhethong.module';
import { GiangVienModule } from './giang_vien/giang_vien.module';
import { DangKyModule } from './dang_ky/dang_ky.module';
import { LopHocPhanModule } from './lop_hoc_phan/lop_hoc_phan.module';
import { PhongHocModule } from './phong_hoc/phong_hoc.module';
import { ThuHocModule } from './thu_hoc/thu_hoc.module';
import { HocKyModule } from './hoc_ky/hoc_ky.module';
import { CaHocModule } from './ca_hoc/ca_hoc.module';
import { BuoiHocModule } from './buoi_hoc/buoi_hoc.module';
import { ThoiKhoaBieuModule } from './thoi_khoa_bieu/thoi_khoa_bieu.module';
import { ThongKeModule } from './thong_ke/thong_ke.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://quocanh:123456789%40!WD@cluster0.nwg10rn.mongodb.net/DangKyMonHocDB?retryWrites=true&w=majority&appName=Cluster0',
    ),
    UserModule,
    SubjectModule,
    LopHocPhanModule,
    NhatKyHeThongModule,
    NhatKyHeThongModule,
    GiangVienModule,
    DangKyModule,
    PhongHocModule,
    ThuHocModule,
    HocKyModule,
    CaHocModule,
    BuoiHocModule,
    ThoiKhoaBieuModule,
    ThongKeModule
  ],
})
export class AppModule {}
