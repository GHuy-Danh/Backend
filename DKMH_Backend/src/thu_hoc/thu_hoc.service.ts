import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThuHoc } from './thu_hoc.schema';

@Injectable()
export class ThuHocService {
  constructor(@InjectModel(ThuHoc.name) private model: Model<ThuHoc>) {}

  async findAll(): Promise<ThuHoc[]> {
    return this.model.find().lean().exec() as unknown as Promise<ThuHoc[]>;
  }

  async findById(id: string): Promise<ThuHoc> {
    const doc = await this.model.findOne({ _id: id }).lean().exec();
    if (!doc) throw new NotFoundException(`Không tìm thấy thứ học ${id}`);
    return doc as unknown as ThuHoc;
  }
}
