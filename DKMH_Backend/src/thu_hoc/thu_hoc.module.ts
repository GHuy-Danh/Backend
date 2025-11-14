import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThuHocController } from './thu_hoc.controller';
import { ThuHocService } from './thu_hoc.service';
import { ThuHoc, ThuHocSchema } from './thu_hoc.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThuHoc.name, schema: ThuHocSchema, collection: 'thu_hoc' },
    ]),
  ],
  controllers: [ThuHocController],
  providers: [ThuHocService],
})
export class ThuHocModule {}
