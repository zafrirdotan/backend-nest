import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { TempUser } from './temp-user.entity';

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

    findOneByEmail(email: string): User | undefined {
        return this.users.find(user => user.email === email);
    }

    createTempUser(tempUserId: string): TempUser {
        const newTempUser: TempUser = { tempUserId, createdAt: +new Date(), massagesCount: 1 };
        this.tempUsers.push(newTempUser);
        return newTempUser
    }

    getTempUserAndAddOne(tempUserId: string): TempUser | undefined {
        const tempUser = this.tempUsers.find(user => user.tempUserId === tempUserId);
        tempUser.massagesCount = tempUser.massagesCount + 1;
        return tempUser;
    }
}
