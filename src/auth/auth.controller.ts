import { Body, Controller, Get, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import e, { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { MagicLoginStrategy } from './magiclogin.strategy';
import { PasswordLessLoginDto } from './passwoedless-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private strategy: MagicLoginStrategy) { }

  @Post('login')
  login(@Req() req, @Res() res, @Body(new ValidationPipe()) body: PasswordLessLoginDto) {
    this.authService.validateUser(body.destination);
    return this.strategy.send(req, res);
  }

  @UseGuards(AuthGuard('magiclogin'))
  @Get('login/callback')
  callback(@Req() req, @Res() res: Response) {
    console.log('callback');
    const token = this.authService.generateTokens(req.user);
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.send(req.user);
  }

  @Get('is-logged-in')
  isLoggedIn(@Req() req: Request) {
    if (req?.cookies?.token?.access_token?.length) {
      const user: User = this.authService.getUserFromToken(req.cookies.token.access_token);

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

}
