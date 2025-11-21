/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NhatKyHeThong } from './nhatkyhethong.schema';

@Injectable()
export class NhatKyHeThongService {
  constructor(
    @InjectModel(NhatKyHeThong.name)
    private readonly nhatKyModel: Model<NhatKyHeThong>,
  ) {}

  // 💡 Hàm tiện ích lấy thời gian hiện tại (format: YYYY-MM-DD HH:mm:ss)
  private getCurrentDateTime(): string {
    const now = new Date();
    // Định dạng thời gian theo yêu cầu của bạn (ví dụ: "2025-10-29 13:20:43")
    const pad = (num: number) => num < 10 ? '0' + num : num;
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  private async getNextLogId(): Promise<string> {
    // 1. Tìm log có _id lớn nhất (sắp xếp theo _id giảm dần, chỉ lấy 1)
    const lastLog = await this.nhatKyModel.findOne().sort({ _id: -1 }).select('_id').exec();
    let nextIdNumber = 1;

    if (lastLog && lastLog._id) {
        // 2. Tách số từ LOGxxx (ví dụ: LOG0055 -> 55)
        const match = lastLog._id.match(/LOG(\d+)/);
        if (match) {
            nextIdNumber = parseInt(match[1]) + 1;
        }
    }
    // 3. Định dạng lại thành LOGxxxx (ví dụ: LOG0056)
    return `LOG${nextIdNumber.toString().padStart(4, '0')}`;
  }

  // ✅ Ghi thêm một log mới (Sử dụng hàm này)
  async create(logData: Partial<NhatKyHeThong>): Promise<NhatKyHeThong> {
    // 🔥 Tự động tạo _id nếu chưa có, sử dụng hàm custom
    if (!logData._id) {
        logData._id = await this.getNextLogId();
    }
    
    const newLog = new this.nhatKyModel({
      ...logData,
      thoi_gian: this.getCurrentDateTime(), // Tự động thêm thời gian
    });
    
    return newLog.save();
  }

  // 💡 Hàm ghi log Đăng nhập thành công (Được gọi từ UserController)
  async logLoginSuccess(userId: string, userName: string, userType: string): Promise<void> {
    const logEntry: Partial<NhatKyHeThong> = {
      nguoi: userId, // Mã người dùng (MaSV/MaGV/Admin)
      hanh_dong: 'Đăng nhập',
      chi_tiet: {
        trang_thai: 'Thành công',
        ten_nguoi_dung: userName,
        loai_tk: userType, // Thêm loại tài khoản
      },
    };
    
    // Non-blocking call (fire-and-forget)
    this.create(logEntry).catch(err => console.error('Lỗi khi ghi log đăng nhập:', err));
  }

  // ✅ Lấy toàn bộ nhật ký (sắp xếp theo thời gian mới nhất)
  async findAll(): Promise<NhatKyHeThong[]> {
    return this.nhatKyModel.find().sort({ thoi_gian: -1 }).lean().exec() as unknown as Promise<NhatKyHeThong[]>;
  }

  // ✅ Xóa toàn bộ nhật ký (nếu cần reset)
  async deleteAll(): Promise<{ deletedCount: number }> {
    const result = await this.nhatKyModel.deleteMany({});
    return { deletedCount: result.deletedCount ?? 0 };
  }

  // ✅ Xóa theo mã log
  async deleteOne(id: string): Promise<void> {
    const result = await this.nhatKyModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Không tìm thấy nhật ký có mã ${id}`);
    }
  }
}