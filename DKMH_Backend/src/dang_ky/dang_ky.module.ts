import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DangKy, DangKySchema } from './dang_ky.schema';
import { DangKyService } from './dang_ky.service';
import { DangKyController } from './dang_ky.controller';
import { User, UserSchema } from '../user/user.schema';
import { NhatKyHeThongModule } from '../nhatkyhethong/nhatkyhethong.module';
@Module({
  imports: [
    NhatKyHeThongModule,
    MongooseModule.forFeature([{ name: DangKy.name, schema: DangKySchema, collection: 'dang_ky' },
  { name: User.name, schema: UserSchema, collection: 'users' }
  ])
],
  providers: [DangKyService],
  controllers: [DangKyController],
  exports: [DangKyService],
})
export class DangKyModule {}
