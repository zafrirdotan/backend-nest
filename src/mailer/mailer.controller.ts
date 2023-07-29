import { Controller, Get } from '@nestjs/common';
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

  @Get('template')
  sendTemplate(): any {
    return this.mailerService.sendUserConfirmation({ email: 'dolev.dotan@gmail.com', username: 'Zafrir' }, '123456');
  }
}
