import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { MagicLoginStrategy } from './magiclogin.strategy';
import { MagicSignupStrategy } from './magicSignup.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MailerModule } from 'src/mailer/mailer.module';
import { MailerService } from 'src/mailer/mailer.service';
import { JwtAllow3FirstStrategy } from './jwt-allow-3-first.strategy';

@Module({
  imports: [UsersModule, PassportModule, MailerModule, JwtModule.registerAsync({
    useFactory: () => ({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  }),],
  controllers: [AuthController],
  providers: [AuthService, MagicLoginStrategy, MagicSignupStrategy, JwtStrategy, JwtAllow3FirstStrategy, MailerService],
  exports: [AuthService]
})
export class AuthModule { }
