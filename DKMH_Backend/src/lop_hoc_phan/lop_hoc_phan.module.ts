// src/lop_hoc_phan/lop-hoc-phan.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LopHocPhanService } from './lop_hoc_phan.service';
import { LopHocPhanController } from './lop_hoc_phan.controller';
import { LopHocPhanSchema, LopHocPhan } from './lop_hoc_phan.schema';
import { LopHocPhanConfigSchema, LopHocPhanConfig } from './lop_hoc_phan_config.schema';
// Các schema khác mà service cần (đổi tên nếu bạn khác)
import { SubjectSchema, Subject } from '../subject/subject.schema';
import { DangKySchema, DangKy } from '../dang_ky/dang_ky.schema';
import { GiangVienSchema, GiangVien } from '../giang_vien/giang_vien.schema';
import { PhongHocSchema, PhongHoc } from '../phong_hoc/phong_hoc.schema';
import { ThuHocSchema, ThuHoc } from '../thu_hoc/thu_hoc.schema';
import { CaHocSchema, CaHoc } from '../ca_hoc/ca_hoc.schema';
import { BuoiHocSchema, BuoiHoc } from '../buoi_hoc/buoi_hoc.schema';
import { UserSchema, User } from 'src/user/user.schema';
import { NhatKyHeThongModule } from '../nhatkyhethong/nhatkyhethong.module'; 
@Module({
  imports: [
    NhatKyHeThongModule,
    MongooseModule.forFeature([
      { name: LopHocPhan.name, schema: LopHocPhanSchema, collection: 'lop_hoc_phan' },
      { name: Subject.name, schema: SubjectSchema, collection: 'mon_hoc' },
      { name: DangKy.name, schema: DangKySchema, collection: 'dang_ky' },
      { name: GiangVien.name, schema: GiangVienSchema, collection: 'giang_vien' },
      { name: PhongHoc.name, schema: PhongHocSchema, collection: 'phong_hoc' },
      { name: ThuHoc.name, schema: ThuHocSchema, collection: 'thu_hoc' },
      { name: CaHoc.name, schema: CaHocSchema, collection: 'ca_hoc' },
      { name: BuoiHoc.name, schema: BuoiHocSchema, collection: 'buoi_hoc' },
      { name : User.name, schema: UserSchema, collection: 'nguoi_dung'},
      { name: LopHocPhanConfig.name, schema: LopHocPhanConfigSchema, collection: 'lop_hoc_phan_configs' },
    ]),
  ],
  controllers: [LopHocPhanController],
  providers: [LopHocPhanService],
  exports: [LopHocPhanService],
})
export class LopHocPhanModule {}
