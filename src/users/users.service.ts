import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { TempUser } from './temp-user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  readonly tempUsers: TempUser[] = [];

  // constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

  // create(user: User): Promise<User> {
  //     const newUser = new this.userModel(user);
  //     return newUser.save()
  // }

  findOneByEmail(email: string): Promise<User> {
    return undefined;
    // return this.userModel.findOne({ email: email });
  }

  // async findAll(): Promise<User[]> {
  //     return this.userModel.find().exec();
  // }
}
