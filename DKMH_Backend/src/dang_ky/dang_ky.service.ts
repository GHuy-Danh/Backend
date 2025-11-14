import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DangKy } from './dang_ky.schema';

@Injectable()
export class DangKyService {
  constructor(@InjectModel(DangKy.name) private dkModel: Model<DangKy>) {}

  async create(data: Partial<DangKy>): Promise<DangKy> {
    const doc = new this.dkModel({
      ...data,
      thoi_gian_dang_ky: data.thoi_gian_dang_ky ? new Date(data.thoi_gian_dang_ky) : new Date(),
    });
    return doc.save();
  }

  async findAll(): Promise<DangKy[]> {
    return this.dkModel.find().lean().exec() as unknown as Promise<DangKy[]>;
  }

  async findById(id: string): Promise<DangKy> {
    const item = await this.dkModel.findById(id).lean().exec();
    if (!item) throw new NotFoundException(`Không tìm thấy đăng ký ${id}`);
    return item as unknown as DangKy;
  }

  async findByStudent(ma_sv: string): Promise<DangKy[]> {
    return this.dkModel.find({ ma_sv }).lean().exec() as unknown as Promise<DangKy[]>;;
  }

  async findByClass(ma_lop_hp: string): Promise<DangKy[]> {
    return this.dkModel.find({ ma_lop_hp }).lean().exec() as unknown as Promise<DangKy[]>;;
  }

  async countByClass(ma_lop_hp: string): Promise<number> {
    return this.dkModel.countDocuments({ ma_lop_hp }).exec();
  }

  async update(id: string, data: Partial<DangKy>): Promise<DangKy> {
    const updated = await this.dkModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
    if (!updated) throw new NotFoundException(`Không tìm thấy đăng ký ${id}`);
    return updated as unknown as DangKy;
  }

  async delete(id: string): Promise<{ deletedCount?: number }> {
    const res = await this.dkModel.deleteOne({ _id: id }).exec();
    return res;
  }
}
