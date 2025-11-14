import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'ca_hoc' })
export class CaHoc extends Document {
  @Prop() declare _id: string;
  @Prop() ma_ca: string;
  @Prop() ca: string; // "Tiết 1", "Tiết 7-9", etc
}

export const CaHocSchema = SchemaFactory.createForClass(CaHoc);
