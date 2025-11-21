/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Subject extends Document {
  @Prop({ unique: true, required: true }) ma_hoc_phan: string;
  @Prop() ten_hoc_phan: string;
  @Prop() khoi: string;
  @Prop() loai: string;
  @Prop() hoc_ky: number;
  @Prop() so_tin_chi: number;
  @Prop() pham_vi: string;
  @Prop() chuyen_nganh?: string;
  @Prop() ma_chuyen_nganh?: string;
  @Prop({
    type: {
      hoc_truoc: { type: [String], default: [] },
      tien_quyet: { type: [String], default: [] }
    },
    default: {}
  })
  dieu_kien: {
    hoc_truoc: string[];
    tien_quyet: string[];
  };
  @Prop() so_buoi_hoc: number;
  @Prop() so_lop_toi_da: number;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

// ✅ Đảm bảo MongoDB có index duy nhất
SubjectSchema.index({ ma_hoc_phan: 1 }, { unique: true });