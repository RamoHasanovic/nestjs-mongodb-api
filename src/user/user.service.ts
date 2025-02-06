import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private UserModel: mongoose.Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.UserModel.find();
    return users;
  }

  async create(user: User): Promise<User> {
    const res = await this.UserModel.create(user);
    return res;
  }

  async findById(id: string): Promise<User> {
    const user = await this.UserModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateById(id: string, user: User): Promise<User | null> {
    return await this.UserModel.findByIdAndUpdate(id, user, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<User | null> {
    return await this.UserModel.findByIdAndDelete(id);
  }
}
