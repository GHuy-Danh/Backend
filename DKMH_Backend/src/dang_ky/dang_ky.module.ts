import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DangKy, DangKySchema } from './dang_ky.schema';
import { DangKyService } from './dang_ky.service';
import { DangKyController } from './dang_ky.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: DangKy.name, schema: DangKySchema, collection: 'dang_ky' }])],
  providers: [DangKyService],
  controllers: [DangKyController],
  exports: [DangKyService],
})
export class DangKyModule {}
