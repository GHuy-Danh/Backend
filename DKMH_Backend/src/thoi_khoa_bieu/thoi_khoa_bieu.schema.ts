import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// === 1. KHAI BÁO SCHEMA CON (Subdocument) ===
@Schema()
export class BuoiHocChiTiet extends Document {
  @Prop() ngay_hoc: Date;
  @Prop() tuan_thu: number; // Tuần thứ mấy (1, 2, 3...)
  @Prop({ default: 'Bình thường' }) trang_thai: string; // "Bình thường", "Nghỉ", "Học bù"
}
// Cần tạo Schema cho BuoiHocChiTiet
export const BuoiHocChiTietSchema = SchemaFactory.createForClass(BuoiHocChiTiet);
// ===========================================

@Schema({ collection: 'thoi_khoa_bieu', timestamps: true })
export class ThoiKhoaBieu extends Document {
  @Prop({ required: true, unique: true })
  ma_lop_hp: string;

  @Prop({ type: [String], default: [] })
  danh_sach_sv: string[]; // 👈 Mảng chứa ma_sv của các sinh viên trong lớp

  @Prop() ma_hoc_phan: string;
  @Prop() ten_hoc_phan: string;
  @Prop() ma_gv: string;
  @Prop() hoc_ky: number;
  
  @Prop() phong: string;
  @Prop() thu: string;     // "Thứ 2"
  @Prop() ca_dau: string;  // "Tiết 1"
  @Prop() ca_cuoi: string; // "Tiết 3"
  @Prop() so_buoi_hoc: number; // 10 hoặc 15

  // 👈 Lưu mảng các ngày học cụ thể để Admin có thể sửa trạng thái từng ngày
  @Prop({ type: [BuoiHocChiTiet], default: [] })
  chi_tiet_buoi_hoc: BuoiHocChiTiet[];
}

export const ThoiKhoaBieuSchema = SchemaFactory.createForClass(ThoiKhoaBieu);