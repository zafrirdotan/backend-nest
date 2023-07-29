import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';


@Module({
  controllers: [MailerController],
  providers: [MailerService],
  imports: [
    NestMailerModule.forRoot({
      // transport: {
      //   host: 'smtp.gmail.com', // Replace with your email SMTP information
      //   // secure: false, // true for 465, false for other ports
      //   auth: {
      //     user: 'zafrir.dotan@gmail.com', // generated ethereal user
      //     // pass: '7378463', // generated ethereal password
      //   },
      // },
      transport: 'smtps://zafrir.dotan@gmail.com:pass@smtp.gmail.com',
      defaults: {
        from: '"No Reply" <no-reply@example.com>', // outgoing email ID
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
})
export class MailerModule { }
