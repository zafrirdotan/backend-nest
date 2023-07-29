import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { TempUser } from './entitys/temp-user.entity';

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    validateUser(email: string): User | undefined {
        console.log('validateUser:', email);

        const user = this.usersService.findOneByEmail(email);
        console.log('user:', user);

        if (!user) {
            throw new UnauthorizedException()
        }

        return user;
    }

    generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
        }
    }

    generateTempUserToken() {
        const payload = { messageCount: 0, firstCreatedAt: new Date(), type: 'temp_user' };
        return {
            temp_user_access_token: this.jwtService.sign(payload),
        }
    }

    refreshTempUserToken(tempUser: TempUser) {
        const payload = { ...tempUser, messageCount: tempUser.messageCount + 1 };
        return {
            temp_user_access_token: this.jwtService.sign(payload),
        }
    }

    getUserFromToken(token: string): User | undefined {
        try {
            if (this.jwtService.verify(token)) {
                return;
            }
        } catch (e) {

            return
        }

        const payload = this.jwtService.decode(token);
        return this.validateUser(payload['email']);
    }
}
