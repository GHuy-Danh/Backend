/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject } from './subject.schema';

export interface SubjectResult {
  ma_hoc_phan: string;
  ten_hoc_phan: string;
  khoi: string;
  loai: string;
  hoc_ky: number;
  so_tin_chi: number;
  pham_vi?: string;
  ma_chuyen_nganh?: string;
}

@Injectable()
export class SubjectService {
  constructor(@InjectModel(Subject.name) private subjectModel: Model<Subject>) {}

  async findAllSubjects(): Promise<SubjectResult[]> {
  return this.subjectModel.find().sort({ ma_hoc_phan: 1 }).lean();
}


  async createSubject(subjectData: any): Promise<Subject | Error> {
    const existing = await this.subjectModel.findOne({ ma_hoc_phan: subjectData.ma_hoc_phan });
    if (existing) {
      return new Error(`Mã học phần "${subjectData.ma_hoc_phan}" đã tồn tại!`);
    }

    const created = new this.subjectModel(subjectData);
    const saved = await created.save();
    return saved;
  }


 async updateSubject(maHocPhan: string, subjectData: any): Promise<Subject> {
    if ('_id' in subjectData) delete subjectData._id;

    // ép lại điều kiện để không bao giờ bị string
    if (subjectData.dieu_kien) {
      subjectData.dieu_kien = {
        hoc_truoc: Array.isArray(subjectData.dieu_kien.hoc_truoc)
          ? subjectData.dieu_kien.hoc_truoc
          : subjectData.dieu_kien.hoc_truoc
          ? [subjectData.dieu_kien.hoc_truoc]
          : [],

        tien_quyet: Array.isArray(subjectData.dieu_kien.tien_quyet)
          ? subjectData.dieu_kien.tien_quyet
          : subjectData.dieu_kien.tien_quyet
          ? [subjectData.dieu_kien.tien_quyet]
          : [],
      };
    }

    const updated = await this.subjectModel.findOneAndUpdate(
      { ma_hoc_phan: maHocPhan },
      { $set: subjectData },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException(`Không tìm thấy môn học ${maHocPhan}`);
    }

    return updated;
  }

  async deleteSubject(maHocPhan: string): Promise<void> {
    const deleted = await this.subjectModel.findOneAndDelete({ ma_hoc_phan: maHocPhan });
    if (!deleted) throw new NotFoundException(`Không tìm thấy môn học ${maHocPhan} để xóa.`);
  }
}
