import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiangVien } from './giang_vien.schema';

@Injectable()
export class GiangVienService {
  constructor(@InjectModel(GiangVien.name) private gvModel: Model<GiangVien>) {}

  async findAll(): Promise<GiangVien[]> {
    return this.gvModel.find().lean().exec() as unknown as Promise<GiangVien[]>; ;
  }

  async findById(id: string) {
    const gv = await this.gvModel.findById(id).lean().exec();
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');
    return gv;
  }

  async create(data: any) {
    // kiểm tra unique mã giảng viên
    const exists = await this.gvModel.findOne({ ma_gv: data.ma_gv }).exec();
    if (exists) throw new BadRequestException(`Mã giảng viên "${data.ma_gv}" đã tồn tại`);
    const created = new this.gvModel(data);
    return created.save();
  }

  async update(ma_gv: string, data: any) {
    const updated = await this.gvModel.findOneAndUpdate({ ma_gv }, { $set: data }, { new: true }).exec();
    if (!updated) throw new NotFoundException(`Không tìm thấy giảng viên ${ma_gv}`);
    return updated;
  }

  async delete(ma_gv: string) {
    const deleted = await this.gvModel.findOneAndDelete({ ma_gv }).exec();
    if (!deleted) throw new NotFoundException(`Không tìm thấy giảng viên ${ma_gv}`);
    return { success: true };
  }

  // (Tùy chọn) tìm theo ngành
  async findByNganh(nganh: string) {
    return this.gvModel.find({ nganh_day: nganh }).lean().exec();
  }
}
