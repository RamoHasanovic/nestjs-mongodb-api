import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
