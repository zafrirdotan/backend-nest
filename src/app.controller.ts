import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('*')
  root(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', '../frontend-angular/dist/open-ai-frontend', 'index.html'));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('protected')
  getProtected(@Req() req): string {
    return req.user.name;
  }
}
