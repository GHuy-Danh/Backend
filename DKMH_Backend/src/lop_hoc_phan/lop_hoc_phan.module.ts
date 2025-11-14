import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LopHocPhan, LopHocPhanSchema } from './lop_hoc_phan.schema';
import { LopHocPhanService } from './lop_hoc_phan.service';
import { LopHocPhanController } from './lop_hoc_phan.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: LopHocPhan.name, schema: LopHocPhanSchema, collection: 'lop_hoc_phan' }])],
  providers: [LopHocPhanService],
  controllers: [LopHocPhanController],
  exports: [LopHocPhanService],
})
export class LopHocPhanModule {}
