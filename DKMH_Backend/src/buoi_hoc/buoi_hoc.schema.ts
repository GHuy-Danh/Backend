import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'buoi_hoc' })
export class BuoiHoc extends Document {
  @Prop() declare _id: string;
  @Prop() ma_buoi: string;
  @Prop() buoi: string; // "Sáng", "Chiều", "Tối"
}

export const BuoiHocSchema = SchemaFactory.createForClass(BuoiHoc);
