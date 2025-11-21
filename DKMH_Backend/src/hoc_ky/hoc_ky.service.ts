import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HocKy } from './hoc_ky.schema';

@Injectable()
export class HocKyService {
  constructor(@InjectModel(HocKy.name) private model: Model<HocKy>) {}

  async findAll(): Promise<HocKy[]> {
    return this.model.find().lean().exec() as unknown as Promise<HocKy[]>;
  }

  async findById(id: string): Promise<HocKy> {
    const doc = await this.model.findOne({ _id: id }).lean().exec();
    if (!doc) throw new NotFoundException(`Không tìm thấy học kỳ ${id}`);
    return doc as unknown as HocKy;
  }
}
