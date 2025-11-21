import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuoiHocController } from './buoi_hoc.controller';
import { BuoiHocService } from './buoi_hoc.service';
import { BuoiHoc, BuoiHocSchema } from './buoi_hoc.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BuoiHoc.name, schema: BuoiHocSchema, collection: 'buoi_hoc' },
    ]),
  ],
  controllers: [BuoiHocController],
  providers: [BuoiHocService],
})
export class BuoiHocModule {}
