import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CaHoc } from './ca_hoc.schema';

@Injectable()
export class CaHocService {
  constructor(@InjectModel(CaHoc.name) private model: Model<CaHoc>) {}

  async findAll(): Promise<CaHoc[]> {
    return this.model.find().lean().exec() as unknown as Promise<CaHoc[]>;
  }

  async findById(id: string): Promise<CaHoc> {
    const doc = await this.model.findOne({ _id: id }).lean().exec();
    if (!doc) throw new NotFoundException(`Không tìm thấy ca học ${id}`);
    return doc as unknown as CaHoc;
  }
}
