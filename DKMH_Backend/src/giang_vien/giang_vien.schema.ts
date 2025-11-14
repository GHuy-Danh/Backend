import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'giang_vien' })
export class GiangVien extends Document {
  @Prop() ma_gv: string;
  @Prop() ten_giang_vien: string;
  @Prop() nganh_day: string;
  @Prop() so_dien_thoai: string;
  @Prop() email: string;

  // optional fields
  @Prop() chuyen_nganh?: string;
  @Prop() so_lop_day?: number;
  @Prop() trang_thai?: string;
}

export const GiangVienSchema = SchemaFactory.createForClass(GiangVien);
