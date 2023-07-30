import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { TempUser } from './temp-user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

    readonly users: User[] = [
        { name: 'John Doe', email: 'zafrir.dotan@gmail.com', id: 1 },
        { name: 'Alice Caeiro', email: 'zafrir.dotan2@gmail.com', id: 2 },
        { name: 'Who Knows', email: 'z@gmail.com', id: 3 },
        { name: 'Jane Doe', email: 'jane@doe', id: 4 },
        { name: 'Johnny Doe', email: 'johnny@doe', id: 5 },
        { name: 'Janie Doe', email: 'janie@doe', id: 6 },
        { name: 'Jordan Doe', email: 'jordan@doe', id: 7 },
        { name: 'Jim Doe', email: 'jim@doe', id: 8 },
        { name: 'Jill Doe', email: 'jill@doe', id: 9 },
        { name: 'Jessie Doe', email: 'jessie@doe', id: 10 },
        { name: 'Jasper Doe', email: 'jasper@doe', id: 11 },
        { name: 'Jared Doe', email: 'jared@doe', id: 12 },

    ]

    readonly tempUsers: TempUser[] = [];

    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    create(user: User): Promise<User> {
        const newUser = new this.userModel(user);
        return newUser.save()
    }

    findOneByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email: email });
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }


}
