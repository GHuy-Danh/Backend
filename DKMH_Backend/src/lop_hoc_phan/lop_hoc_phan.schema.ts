import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LopHocPhan extends Document {
  @Prop() declare _id: string; // e.g. "LHP_QTKD020" or generated ObjectId
  @Prop() ma_lop_hp: string;
  @Prop() ma_mon: string;
  @Prop() ten?: string;
  @Prop() giang_vien?: string;
  @Prop() phong?: string;
  @Prop() si_so_toi_da?: number;
  @Prop() si_so_hien_tai?: number;
  @Prop() hoc_ky?: number;
  @Prop() so_tuan_hoc?: number;
  @Prop() thu?: string;
  @Prop() ca?: string;
  @Prop() si_so_toi_thieu?: number;
  @Prop() trang_thai?: string; // e.g. "mo", "huy", "chua_phan_lop"
  @Prop({ type: Array }) danh_sach_sv?: any[]; // array of { ma_sv, trang_thai_in_class }
  @Prop() phan_lop_auto?: boolean;
//   @Prop() meta?: any;
}

export const LopHocPhanSchema = SchemaFactory.createForClass(LopHocPhan);
