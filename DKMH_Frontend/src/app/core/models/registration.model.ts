// src/app/core/models/registration.model.ts
export interface DangKyMonHoc {
  _id: string;
  ma_sv: string;
  hoc_ky: number | string;
  ma_mon: string;
  ma_lop_hp: string;
  trang_thai: string;
  thoi_gian?: string | Date;
}

export interface MonHocDaDangKy {
  _id: string;
  ma_dk: string;
  ma_sv: string;
  ma_mon: string;
  ma_lop_hp: string;
  ten_mon: string;
  hoc_ky: number | string;
  trang_thai: string;
}

export interface ElectiveCourse {
  ma_mon: string;
  ma_lop_hp: string;
  ten_mon: string;
  tc: number; // tín chỉ
  bat_buoc?: boolean;
  hoc_ky: number | string;
  nhom_tu_chon?: string;
  stc_nhom?: number;
  prerequisites?: string[]; // danh sách mã môn tiên quyết
  seats_total?: number;
  seats_registered?: number;
  giang_vien?: string;
  lich?: string; // mô tả lịch đơn giản
}
