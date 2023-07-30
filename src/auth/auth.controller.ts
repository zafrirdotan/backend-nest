import { Body, Controller, Get, HttpException, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import e, { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { MagicLoginStrategy } from './magiclogin.strategy';
import { PasswordLessLoginDto } from './passwoedless-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';
import { MagicSignupStrategy } from './magicSignup.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private magicLoginStrategy: MagicLoginStrategy, private magicSignupStrategy: MagicSignupStrategy) { }

  @Post('login')
  login(@Req() req, @Res() res, @Body(new ValidationPipe()) body: PasswordLessLoginDto) {
    this.authService.validateUser(body.destination);
    return this.magicLoginStrategy.send(req, res);
  }

  @UseGuards(AuthGuard('magiclogin'))
  @Get('login/callback')
  loginCallback(@Req() req, @Res() res: Response) {
    console.log('callback');
    const token = this.authService.generateTokens(req.user);
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.send(req.user);
  }

  @Get('is-logged-in')
  async isLoggedIn(@Req() req: Request) {
    if (req?.cookies?.token?.access_token?.length) {
      const user: User = await this.authService.getUserFromToken(req.cookies.token.access_token);

      if (user) {
        return { isLoggedIn: true, user };
      } else {
        return { isLoggedIn: false };
      }
    }

  }


  @Get('temp-user')
  getTemp(@Res() res, @Req() req: Request) {
    if (req?.cookies?.token?.temp_user_access_token?.length || req?.cookies?.token?.access_token?.length) {
      res.send({ status: 'exists' });
      return;
    }

    const temp_token = this.authService.generateTempUserToken();
    res.cookie('token', temp_token, {
      httpOnly: true,
    });

    res.send({ status: 'created' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  logout(@Res() res) {
    res.clearCookie('token');
    res.send({ status: 'ok' });
  }

  @Post('signup')
  signup(@Req() req, @Res() res, @Body(new ValidationPipe()) body: PasswordLessLoginDto) {
    const user = this.authService.validateUser(body.destination);
    if (user) {
      throw new HttpException('User already exists', 400);
    } else {
      return this.magicSignupStrategy.send(req, res);
    }
  }

  @UseGuards(AuthGuard('magicSignup'))
  @Post('signup/callback')
  async signupCallback(@Req() req, @Res() res: Response) {
    const user = await this.authService.createNewUser(req.body.fullName, req.user.email);

    const token = this.authService.generateTokens(user);
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.send(user);
  }

}
