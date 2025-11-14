import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiangVienService } from './giang_vien.service';
import { GiangVienController } from './giang_vien.controller';
import { GiangVien, GiangVienSchema } from './giang_vien.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GiangVien.name, schema: GiangVienSchema, collection: 'giang_vien' }]),
  ],
  controllers: [GiangVienController],
  providers: [GiangVienService],
})
export class GiangVienModule {}
