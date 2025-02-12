import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  username: string;

  @Prop()
  age: number;

  @Prop()
  city: string;

  @Prop({ type: Types.ObjectId })
  _id?: mongoose.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
