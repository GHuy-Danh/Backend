import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhongHoc } from './phong_hoc.schema';

@Injectable()
export class PhongHocService {
  constructor(@InjectModel(PhongHoc.name) private model: Model<PhongHoc>) {}

  async findAll(): Promise<PhongHoc[]> {
    return this.model.find().lean().exec() as unknown as Promise<PhongHoc[]>;
  }

  async findById(id: string): Promise<PhongHoc> {
    const doc = await this.model.findOne({ _id: id }).lean().exec();
    if (!doc) throw new NotFoundException(`Không tìm thấy phòng học ${id}`);
    return doc as unknown as PhongHoc;
  }
}
