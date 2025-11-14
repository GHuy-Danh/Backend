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

  // ✅ Lấy toàn bộ nhật ký (sắp xếp theo thời gian mới nhất)
  async findAll(): Promise<NhatKyHeThong[]> {
    return this.nhatKyModel.find().sort({ thoi_gian: -1 }).lean().exec() as unknown as Promise<NhatKyHeThong[]>;
  }

  // ✅ Ghi thêm một log mới
  async create(logData: Partial<NhatKyHeThong>): Promise<NhatKyHeThong> {
    const newLog = new this.nhatKyModel(logData);
    return newLog.save();
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
