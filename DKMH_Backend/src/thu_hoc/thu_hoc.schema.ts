import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'thu_hoc' })
export class ThuHoc extends Document {
  @Prop() declare _id: string;
  @Prop() ma_thu: string;
  @Prop() thu: string;
}

export const ThuHocSchema = SchemaFactory.createForClass(ThuHoc);
