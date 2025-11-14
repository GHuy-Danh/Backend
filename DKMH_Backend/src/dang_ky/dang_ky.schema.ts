import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DangKy extends Document {
  @Prop() declare _id: string; // e.g. "2001223010_LHP_ATTT_055"
  @Prop() ma_sv: string;
  @Prop() ma_lop_hp: string;
  @Prop() hoc_ky: number;

  @Prop({ type: Object }) // { tinh_trang: string, chi_tiet?: any }
  trang_thai: any;
  @Prop({ type: [String] }) tinh_trang?: string[];
  @Prop({ type: [String] }) chi_tiet?: string[];

  @Prop() phong?: string;
  @Prop() thu?: string;
  @Prop() ca?: string;

  @Prop() si_so_toi_da?: number;
  @Prop() si_so_hien_tai?: number;
  @Prop() si_so_toi_thieu?: number;

  @Prop() thoi_gian_dang_ky?: Date;
  @Prop() dang_ky_tu_do?: boolean;

  @Prop() ma_hoc_phan?: string;
  @Prop() ten_hoc_phan?: string;
  @Prop() ma_gv?: string;

}

export const DangKySchema = SchemaFactory.createForClass(DangKy);
