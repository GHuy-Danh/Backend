/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LopHocPhanConfig extends Document {
  // Cấu hình này áp dụng cho môn nào
  @Prop({ required: true, index: true })
  ma_hoc_phan: string;

  // Cấu hình này áp dụng cho học kỳ nào
  @Prop({ required: true, index: true })
  hoc_ky: number;

  // Sĩ số tùy chỉnh
  @Prop({ required: true })
  si_so_toi_da: number;

  @Prop({ required: true })
  si_so_toi_thieu: number;

  // Lưu lại ai đã cập nhật (nếu cần)
  @Prop()
  updated_by_admin_id?: string;
}

export const LopHocPhanConfigSchema = SchemaFactory.createForClass(LopHocPhanConfig);

// Tạo index tổng hợp để tìm kiếm nhanh
LopHocPhanConfigSchema.index({ ma_hoc_phan: 1, hoc_ky: 1 }, { unique: true });