/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'NhatKyHeThong' }) 
export class NhatKyHeThong extends Document {
  @Prop() declare _id: string; 
  @Prop() nguoi: string; 
  @Prop() hanh_dong: string; 
  @Prop({
    type: Object,
    default: {},
  })
  chi_tiet: {
    trang_thai?: string;
    ten_nguoi_dung?: string;
    loai_tk?: string;
    ma_hoc_phan?: string;
    giang_vien?: string;
    phong?: string;
    thu?: string;
    ca?: string;
    si_so_hien_tai?: number;
  };
  @Prop() thoi_gian: string; // "2025-10-29 13:20:43"
}

export const NhatKyHeThongSchema = SchemaFactory.createForClass(NhatKyHeThong);
