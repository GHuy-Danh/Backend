import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DangKy extends Document {
  @Prop() declare _id: string; // ex: "2001223010_LHP_ATTT_055"

  @Prop() ma_sv: string;
  @Prop() ma_lop_hp: string;
  @Prop() hoc_ky: number;

  @Prop() ma_hoc_phan: string;
  @Prop() ten_hoc_phan: string;
  @Prop() so_buoi_hoc?: number;

  @Prop({
    type: Object,
    default: { tinh_trang: 'Đang chờ xử lý', chi_tiet: '' }
  })
  trang_thai: any;

  @Prop() phong?: string;
  @Prop() thu?: string;
  @Prop() ca?: string;
  @Prop() ma_gv?: string;

  @Prop() si_so_toi_da?: number;
  @Prop() si_so_hien_tai?: number;
  @Prop() si_so_toi_thieu?: number;

  @Prop() thoi_gian_dang_ky?: Date;
  @Prop() dang_ky_tu_do?: boolean;

}

export const DangKySchema = SchemaFactory.createForClass(DangKy);
