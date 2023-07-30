import { Controller, Get, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {

  }

  @Get()
  sendMail(): any {
    console.log('sendMail');

    // return this.mailerService.example();
  }

  @Post('signup')
  sendTemplate(): any {
    return this.mailerService.sendUserSignupLink({ email: 'zafrir.dotan@gmail.com', username: 'Zafrir' }, '123456');
  }
}
