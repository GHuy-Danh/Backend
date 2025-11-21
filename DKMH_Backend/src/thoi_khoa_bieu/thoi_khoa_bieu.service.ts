import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThoiKhoaBieu, BuoiHocChiTiet } from './thoi_khoa_bieu.schema';
import { LopHocPhan } from '../lop_hoc_phan/lop_hoc_phan.schema';
import { DangKy } from '../dang_ky/dang_ky.schema';
import { GiangVien } from '../giang_vien/giang_vien.schema';
@Injectable()
export class ThoiKhoaBieuService {
  private readonly logger = new Logger(ThoiKhoaBieuService.name);

  constructor(
    @InjectModel(ThoiKhoaBieu.name) private tkbModel: Model<ThoiKhoaBieu>,
    @InjectModel(LopHocPhan.name) private lhpModel: Model<LopHocPhan>,
    @InjectModel(DangKy.name) private dangKyModel: Model<DangKy>,
    @InjectModel(GiangVien.name) private gvModel: Model<GiangVien>,
  ) {}

  // 1. SINH LỊCH TỰ ĐỘNG (Cho Admin Timetable)
  async generateFromLopHocPhan(hocKy: number) {
    this.logger.log(`Đang sinh lịch cho học kỳ ${hocKy}...`);
    
    // Xóa lịch cũ của học kỳ này để tạo lại
    await this.tkbModel.deleteMany({ hoc_ky: hocKy });

    const listLHP = await this.lhpModel.find({ hoc_ky: hocKy }).lean();
    let count = 0;

    for (const lhp of listLHP) {
      // 1. Lấy danh sách sinh viên đã đăng ký thành công lớp này
      const dks = await this.dangKyModel.find({ 
        ma_lop_hp: lhp.ma_lop_hp, 
        'trang_thai.tinh_trang': 'Đăng ký thành công' 
      }).select('ma_sv').lean();
      
      const listSV = dks.map(d => d.ma_sv);

      // 2. Tính toán danh sách ngày học cụ thể
      const scheduleDetails = this.calculateStudyDates(lhp);

      // 3. Tạo document ThoiKhoaBieu
      const newTkb = new this.tkbModel({
        ma_lop_hp: lhp.ma_lop_hp,
        danh_sach_sv: listSV,
        ma_hoc_phan: lhp.ma_hoc_phan,
        ten_hoc_phan: lhp.ten_hoc_phan,
        ma_gv: lhp.ma_gv,
        hoc_ky: lhp.hoc_ky,
        phong: lhp.phong,
        thu: lhp.thu,
        ca_dau: lhp.ca_dau,
        ca_cuoi: lhp.ca_cuoi,
        so_buoi_hoc: lhp.so_buoi_hoc || 15,
        chi_tiet_buoi_hoc: scheduleDetails
      });

      await newTkb.save();
      count++;
    }
    return { success: true, message: `Đã tạo lịch cho ${count} lớp học phần.` };
  }

  // Helper: Tính ngày học
  private calculateStudyDates(lhp: any): BuoiHocChiTiet[] {
    if (!lhp.ngay_bat_dau || !lhp.thu) return [];
    
    // 👈 THAY ĐỔI: Khai báo biến 'dates' với kiểu BuoiHocChiTiet[]
    const dates: BuoiHocChiTiet[] = [];
    const soBuoi = lhp.so_buoi_hoc || 15;
    const mapThu: Record<string, number> = {
        'Chủ Nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 
        'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6
    };
    const targetDay = mapThu[lhp.thu];
    if (targetDay === undefined) return [];

    // Tìm ngày học đầu tiên đúng thứ
    let current = new Date(lhp.ngay_bat_dau);
    while (current.getDay() !== targetDay) {
      current.setDate(current.getDate() + 1);
    }

    // Loop số buổi
    for (let i = 1; i <= soBuoi; i++) {
      dates.push({
        ngay_hoc: new Date(current),
        tuan_thu: i,
        trang_thai: 'Bình thường'
      } as BuoiHocChiTiet); // 👈 Tốt nhất là thêm 'as BuoiHocChiTiet' để ép kiểu (Cast)
      current.setDate(current.getDate() + 7); // Cộng 1 tuần
    }
    return dates;
  }

  /**
     * Lấy danh sách lịch học (thời khóa biểu) theo học kỳ cho Admin
     * @param hocKy Số học kỳ cần truy vấn
     */
    async getAll(hocKy?: number) {
        // Nếu có hocKy, chỉ lọc những lịch thuộc học kỳ đó
        const filter = hocKy ? { hoc_ky: hocKy } : {}; 
        
        // Lấy tất cả các document ThoiKhoaBieu đã tạo
        return this.tkbModel
            .find(filter)
            .sort({ ma_lop_hp: 1 }) // Sắp xếp theo mã lớp
            .lean();
    }

  // 2. LẤY LỊCH CỦA SINH VIÊN (Cho trang Student Timetable)
  // Tìm các lớp mà danh_sach_sv có chứa ma_sv này
  async getScheduleByStudent(ma_sv: string, hocKy: number) {
    // Tìm các lớp của SV
    const schedules = await this.tkbModel.find({ 
      hoc_ky: hocKy,
      danh_sach_sv: { $in: [ma_sv] } 
    }).lean();

    // Lấy danh sách mã GV duy nhất để query 1 lần
    const maGVs = [...new Set(schedules.map(s => s.ma_gv).filter(Boolean))];
    
    // Tìm thông tin giảng viên
    const giangViens = await this.gvModel.find({ ma_gv: { $in: maGVs } }).lean();
    
    // Tạo Map để tra cứu nhanh: ma_gv -> ten_giang_vien
    const gvMap = new Map(giangViens.map(g => [g.ma_gv, g.ten_giang_vien]));

    // Map tên GV vào kết quả trả về
    return schedules.map(s => ({
        ...s,
        // Thêm trường ten_giang_vien vào kết quả
        ten_giang_vien: gvMap.get(s.ma_gv) || s.ma_gv || 'Chưa phân công' 
    }));
  }

  // 3. LẤY LỊCH CỦA GIẢNG VIÊN (Cho trang Advisor Schedule)
  async getScheduleByLecturer(ma_gv: string, hocKy: number) {
    return this.tkbModel.find({ 
      hoc_ky: hocKy,
      ma_gv: ma_gv 
    }).lean();
  }

  // 4. CẬP NHẬT TRẠNG THÁI BUỔI HỌC (Cho Admin Timetable chỉnh sửa)
  // VD: Nghỉ ngày 20/11
  async updateSessionStatus(ma_lop_hp: string, ngay_hoc: string, status: string) {
    const lop = await this.tkbModel.findOne({ ma_lop_hp });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');

    // Tìm buổi học trong mảng và update
    const targetDate = new Date(ngay_hoc).toISOString().split('T')[0]; // so sánh theo ngày
    
    let updated = false;
    lop.chi_tiet_buoi_hoc.forEach(b => {
      const d = new Date(b.ngay_hoc).toISOString().split('T')[0];
      if (d === targetDate) {
        b.trang_thai = status;
        updated = true;
      }
    });

    if (updated) await lop.save();
    return { success: true };
  }
}