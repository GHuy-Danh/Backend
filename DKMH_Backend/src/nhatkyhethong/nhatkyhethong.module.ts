/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NhatKyHeThong, NhatKyHeThongSchema } from './nhatkyhethong.schema';
import { NhatKyHeThongService } from './nhatkyhethong.service';
import { NhatKyHeThongController } from './nhatkyhethong.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NhatKyHeThong.name, schema: NhatKyHeThongSchema },
    ]),
  ],
  controllers: [NhatKyHeThongController],
  providers: [NhatKyHeThongService],
  exports: [NhatKyHeThongService],
})
export class NhatKyHeThongModule {}
