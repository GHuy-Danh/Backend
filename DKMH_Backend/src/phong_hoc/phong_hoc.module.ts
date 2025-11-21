import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhongHocController } from './phong_hoc.controller';
import { PhongHocService } from './phong_hoc.service';
import { PhongHoc, PhongHocSchema } from './phong_hoc.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhongHoc.name, schema: PhongHocSchema, collection: 'phong_hoc' },
    ]),
  ],
  controllers: [PhongHocController],
  providers: [PhongHocService],
})
export class PhongHocModule {}
