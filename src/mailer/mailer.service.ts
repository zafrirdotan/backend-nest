import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {

    constructor(private readonly mailerService: NestMailerService) { }

    async sendUserLoginLink(user: { email: any; username?: string; }, href: any) {

        try {
            await this.setTransport();

            await this.mailerService.sendMail({
                transporterName: 'gmail',
                to: user.email, // user's email address
                from: 'zafrir.dotan@gmail.com', // the sender address
                subject: 'Welcome to our site', // Subject line
                template: './welcome', // The `.hbs` or `.pug` extension is appended automatically.
                // text: 'welcome', // plaintext body
                context: { // Data to be sent to template engine.
                    href: href,
                    username: user.username,
                },
            });
        } catch (error) {
            console.log('sendUserLoginLink error', error);
        }
    }

    async sendUserSignupLink(user: any, href: string) {
        await this.setTransport();
        console.log('sendUserConfirmation', user, href);

        await this.mailerService.sendMail({
            transporterName: 'gmail',
            to: user.email, // user's email address
            from: 'zafrir.dotan@gmail.com', // the sender address
            subject: 'Welcome to our site', // Subject line
            template: './signup', // The `.hbs` or `.pug` extension is appended automatically.
            // text: 'welcome', // plaintext body
            context: { // Data to be sent to template engine.
                href: href,
                username: user.username,
            },
        });
    }

    private async setTransport() {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            process.env.EMAIL_CLIENT_ID,
            process.env.EMAIL_CLIENT_SECRET,
            process.env.EMAIL_REDIRECT_URI,
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.EMAIL_REFRESH_TOKEN,
        });

        const accessToken: string = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    console.log('Failed to create access token :', err);

                    reject('Failed to create access token');
                }
                resolve(token);
            });
        });



        const config: Options = {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'zafrir.dotan@gmail.com',// this.configService.get('EMAIL'),
                clientId: process.env.EMAIL_CLIENT_ID,
                clientSecret: process.env.EMAIL_CLIENT_SECRET,
                accessToken,
            },
        };
        this.mailerService.addTransporter('gmail', config);
    }

}
