import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LopHocPhan } from './lop_hoc_phan.schema';

@Injectable()
export class LopHocPhanService {
  constructor(@InjectModel(LopHocPhan.name) private lhpModel: Model<LopHocPhan>) {}

  async create(data: Partial<LopHocPhan>): Promise<LopHocPhan> {
    const doc = new this.lhpModel(data);
    return doc.save();
  }

  async findAll(): Promise<LopHocPhan[]> {
    return this.lhpModel.find().lean().exec() as unknown as Promise<LopHocPhan[]>;
  }

  async findById(id: string): Promise<LopHocPhan> {
    const doc = await this.lhpModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException(`Không tìm thấy lớp học phần ${id}`);
    return doc as unknown as LopHocPhan;
  }

  async findByMon(ma_mon: string): Promise<LopHocPhan[]> {
    return this.lhpModel.find({ ma_mon }).lean().exec() as unknown as Promise<LopHocPhan[]>;
  }

  async findByGiangVien(ma_gv: string): Promise<LopHocPhan[]> {
    return this.lhpModel.find({ giang_vien: ma_gv }).lean().exec() as unknown as Promise<LopHocPhan[]>;
  }

  async update(id: string, data: Partial<LopHocPhan>): Promise<LopHocPhan> {
    const updated = await this.lhpModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
    if (!updated) throw new NotFoundException(`Không tìm thấy lớp học phần ${id}`);
    return updated as unknown as LopHocPhan;
  }

  async delete(id: string) {
    const r = await this.lhpModel.deleteOne({ _id: id }).exec();
    return r;
  }
}
