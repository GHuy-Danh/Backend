import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LopHocPhan } from '../lop_hoc_phan/lop_hoc_phan.schema';
import { DangKy } from '../dang_ky/dang_ky.schema';

@Injectable()
export class ThongKeService {
  constructor(
    @InjectModel(LopHocPhan.name) private lhpModel: Model<LopHocPhan>,
    @InjectModel(DangKy.name) private dangKyModel: Model<DangKy>,
  ) {}

  private async countCancelledFromDangKy(hocKy: number) {
    // 1) Lấy danh sách mã học phần có đăng ký kèm số lượng sinh viên cho mỗi mã
    const dangKyStats = await this.dangKyModel.aggregate([
      { $match: { hoc_ky: hocKy } },
      {
        $group: {
          _id: '$ma_hoc_phan',
          ten_hoc_phan: { $first: '$ten_hoc_phan' },
          so_luong: { $sum: 1 }
        }
      }
    ]);

    // Map đăng ký: ma_hoc_phan -> { ten_hoc_phan, so_luong }
    const mapDangKy = new Map<string, { ten_hoc_phan: string; so_luong: number }>();
    for (const d of dangKyStats) {
      if (!d._id) continue;
      mapDangKy.set(d._id, { ten_hoc_phan: d.ten_hoc_phan || '—', so_luong: d.so_luong || 0 });
    }

    // 2) Lấy danh sách mã học phần đã được phân lớp trong lop_hoc_phan
    const lopPhanList = await this.lhpModel.find({ hoc_ky: hocKy }).lean().select('ma_hoc_phan si_so_hien_tai si_so_toi_thieu si_so_toi_da ten_hoc_phan ma_lop_hp');
    const setDaPhan = new Set<string>(lopPhanList.map((l: any) => l.ma_hoc_phan));

    // 3) Những mã trong dang_ky nhưng không có trong lop_hoc_phan => bị hủy
    const cancelledDetails: Array<any> = [];
    let cancelledCount = 0;
    for (const [maHP, info] of mapDangKy.entries()) {
      if (!setDaPhan.has(maHP)) {
        cancelledCount++;
        cancelledDetails.push({
          ma_lop_hp: null, // hoặc '—' nếu bạn muốn hiển thị ký tự
          ma_hoc_phan: maHP,
          ten_hoc_phan: info.ten_hoc_phan,
          si_so: info.so_luong,
          toi_thieu: null, // không có dữ liệu lớp, nên để null hoặc giá trị mặc định
          toi_da: null,
          trang_thai: 'Sẽ hủy'
        });
      }
    }

    return { cancelledCount, cancelledDetails, lopPhanList };
  }

  // 1. Thống kê tổng quan (Dashboard) theo Học kỳ
  async getDashboardStats(hocKy: number) {
    // Lấy kết quả phân tích đăng ký + danh sách lớp đã phân
    const { cancelledCount, cancelledDetails, lopPhanList } = await this.countCancelledFromDangKy(hocKy);

    // Xử lý các lớp đã phân (có trong lop_hoc_phan)
    let lopMo = 0;
    let lopHuy = 0;
    let tongSiSoDangKy = 0;

    const chiTietTrangThai = (lopPhanList || []).map((lop: any) => {
      const siSo = lop.si_so_hien_tai || 0;
      // Giữ nguyên logic cũ: nếu lop có trường si_so_toi_thieu thì so sánh, nếu không có mặc định 10
      const toiThieu = typeof lop.si_so_toi_thieu === 'number' ? lop.si_so_toi_thieu : 10;
      const status = siSo >= toiThieu ? 'Được mở' : 'Sẽ hủy';

      if (status === 'Được mở') lopMo++;
      else lopHuy++;

      tongSiSoDangKy += siSo;

      return {
        ma_lop_hp: lop.ma_lop_hp || null,
        ma_hoc_phan: lop.ma_hoc_phan,
        ten_hoc_phan: lop.ten_hoc_phan || '—',
        si_so: siSo,
        toi_thieu: toiThieu,
        toi_da: lop.si_so_toi_da || null,
        trang_thai: status
      };
    });

    // Kết hợp: thêm các môn có đăng ký nhưng không được phân lớp (được xem là lớp hủy)
    // tăng lopHuy lên bằng cancelledCount
    lopHuy += cancelledCount;
    // Tổng lượt đăng ký cộng thêm số SV của các môn chưa phân lớp
    for (const c of cancelledDetails) {
      tongSiSoDangKy += c.si_so;
      // Append vào chi tiết để frontend có thể hiển thị
      chiTietTrangThai.push({
        ma_lop_hp: c.ma_lop_hp,
        ma_hoc_phan: c.ma_hoc_phan,
        ten_hoc_phan: c.ten_hoc_phan,
        si_so: c.si_so,
        toi_thieu: c.toi_thieu,
        toi_da: c.toi_da,
        trang_thai: c.trang_thai
      });
    }

    const tongSoLop = chiTietTrangThai.length; // bao gồm cả lớp đã phân và các "môn bị hủy" (để hiển thị chi tiết)

    return {
      tong_so_lop: tongSoLop,
      lop_duoc_mo: lopMo,
      lop_se_huy: lopHuy, // giờ đã bao gồm cả lớp 'không được phân' từ dang_ky
      tong_luot_dang_ky: tongSiSoDangKy,
      chi_tiet: chiTietTrangThai
    };
  }

  // 2. Thống kê Top môn học được đăng ký nhiều nhất
  async getTopSubjects(hocKy: number) {
    return this.dangKyModel.aggregate([
      { $match: { hoc_ky: hocKy } },
      { $group: { _id: '$ten_hoc_phan', so_luong: { $sum: 1 }, ma_hoc_phan: { $first: '$ma_hoc_phan' } } },
      { $sort: { so_luong: -1 } }, // Giảm dần
      { $limit: 10 } // Lấy top 10
    ]);
  }
  
}