import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LopHocPhan extends Document {
  @Prop() declare _id: string; 
  @Prop() ma_lop_hp: string;
  @Prop() ma_hoc_phan: string;
  @Prop() ten_hoc_phan: string;
  @Prop() ma_gv: string;
  @Prop() phong?: string;
  @Prop() si_so_toi_da?: number;
  @Prop() si_so_hien_tai?: number;
  @Prop() so_buoi_hoc?: number;
  @Prop() thu?: string;
  @Prop() ca_dau?: string;
  @Prop() ca_cuoi?: string;
  @Prop() si_so_toi_thieu?: number;
  @Prop() ngay_bat_dau?: Date;
  @Prop() ngay_ket_thuc?: Date;
  @Prop() ma_buoi?: string;
  @Prop() hoc_ky?: number;
}

export const LopHocPhanSchema = SchemaFactory.createForClass(LopHocPhan);
