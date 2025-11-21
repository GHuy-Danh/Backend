// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { DangKySchema } from 'src/dang_ky/dang_ky.schema';
import { SubjectSchema } from 'src/subject/subject.schema';
import { NhatKyHeThongModule } from '../nhatkyhethong/nhatkyhethong.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema, collection: 'nguoi_dung' },
      { name: 'DangKy', schema: DangKySchema, collection: 'dang_ky' },
      { name: 'Subject', schema: SubjectSchema, collection: 'mon_hoc' },
    ]),
    NhatKyHeThongModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
