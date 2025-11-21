import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop()
  declare _id: string;
  @Prop()
  ho_ten: string;
  @Prop()
  email: string;
  @Prop()
  loai: string;
  @Prop()
  mat_khau: string;
  // 🔹 Các trường cho Sinh viên
  @Prop()
  ma_sv?: string;
  @Prop()
  lop?: string;
  @Prop()
  khoa_hoc?: string;
  @Prop()
  trang_thai?: string;
  // 🔹 Các trường cho Giảng viên
  @Prop()
  ma_gv?: string;
  @Prop()
  nganh_day?: string;
  // 🔹 🔥 Thêm trường cho Quản trị viên
  @Prop() chuc_vu?: string;
  @Prop() gioi_tinh?: string;
  @Prop() ngay_sinh?: string;
  @Prop() so_dien_thoai?: string;
  @Prop() dia_chi?: string;
  @Prop() nganh_hoc?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
