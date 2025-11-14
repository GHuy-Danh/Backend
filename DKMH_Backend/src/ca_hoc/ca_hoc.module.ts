import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaHocController } from './ca_hoc.controller';
import { CaHocService } from './ca_hoc.service';
import { CaHoc, CaHocSchema } from './ca_hoc.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CaHoc.name, schema: CaHocSchema, collection: 'ca_hoc' },
    ]),
  ],
  controllers: [CaHocController],
  providers: [CaHocService],
})
export class CaHocModule {}
