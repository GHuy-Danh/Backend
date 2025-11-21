import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThongKeController } from './thong_ke.controller';
import { ThongKeService } from './thong_ke.service';
import { LopHocPhan, LopHocPhanSchema } from '../lop_hoc_phan/lop_hoc_phan.schema';
import { DangKy, DangKySchema } from '../dang_ky/dang_ky.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LopHocPhan.name, schema: LopHocPhanSchema, collection: 'lop_hoc_phan' },
      { name: DangKy.name, schema: DangKySchema, collection: 'dang_ky' },
      { name: Subject.name, schema: SubjectSchema, collection: 'mon_hoc' },
    ]),
  ],
  controllers: [ThongKeController],
  providers: [ThongKeService],
})
export class ThongKeModule {}