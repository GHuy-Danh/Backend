import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'phong_hoc' })
export class PhongHoc extends Document {
  @Prop() ma_phong: string;
  @Prop() loai_phong?: string;
}

export const PhongHocSchema = SchemaFactory.createForClass(PhongHoc);
