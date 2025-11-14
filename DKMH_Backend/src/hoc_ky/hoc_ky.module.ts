import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HocKyController } from './hoc_ky.controller';
import { HocKyService } from './hoc_ky.service';
import { HocKy, HocKySchema } from './hoc_ky.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HocKy.name, schema: HocKySchema, collection: 'hoc_ky' },
    ]),
  ],
  controllers: [HocKyController],
  providers: [HocKyService],
})
export class HocKyModule {}
