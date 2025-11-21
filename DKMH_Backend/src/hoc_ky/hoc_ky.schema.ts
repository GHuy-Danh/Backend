import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'hoc_ky' })
export class HocKy extends Document {
  @Prop() declare _id: string;
  @Prop() ma_hoc_ky: number;
  @Prop() ten: string;        // "Học kỳ 1"
  @Prop() nam_hoc: string;    // "2021-2022"
  @Prop() trang_thai: string; // "Đang diễn ra", "Đã kết thúc", ...
}

export const HocKySchema = SchemaFactory.createForClass(HocKy);
