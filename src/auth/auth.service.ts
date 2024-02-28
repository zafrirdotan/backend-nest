import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { TempUser } from './entitys/temp-user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string): Promise<User | undefined> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  findUserByEmail(email: string): Promise<User | undefined> {
    return undefined;
    // return this.usersService.findOneByEmail(email);
  }

  generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  generateTokenFromMail(email: string) {
    const payload = { email, type: 'signup' };
    return this.jwtService.sign(payload);
  }

  generateTempUserToken() {
    const payload = {
      messageCount: 0,
      firstCreatedAt: new Date(),
      type: 'temp_user',
    };
    return {
      temp_user_access_token: this.jwtService.sign(payload),
    };
  }

  refreshTempUserToken(tempUser: TempUser) {
    const payload = { ...tempUser, messageCount: tempUser.messageCount + 1 };
    return {
      temp_user_access_token: this.jwtService.sign(payload),
    };
  }

  async getUserFromToken(token: string): Promise<User | undefined> {
    try {
      if (this.jwtService.verify(token)) {
        return;
      }
    } catch (e) {
      return;
    }

    const payload = this.jwtService.decode(token);
    return await this.validateUser(payload['email']);
  }

  createNewUser(name: string, email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      resolve({ id: 1, name, email } as User);
    });

    // return this.usersService.create({ email, name });
  }
}
