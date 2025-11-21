import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BuoiHoc } from './buoi_hoc.schema';

@Injectable()
export class BuoiHocService {
  constructor(@InjectModel(BuoiHoc.name) private model: Model<BuoiHoc>) {}

  async findAll(): Promise<BuoiHoc[]> {
    return this.model.find().lean().exec() as unknown as Promise<BuoiHoc[]>;
  }

  async findById(id: string): Promise<BuoiHoc> {
    const doc = await this.model.findOne({ _id: id }).lean().exec();
    if (!doc) throw new NotFoundException(`Không tìm thấy buổi học ${id}`);
    return doc as unknown as BuoiHoc;
  }
}
