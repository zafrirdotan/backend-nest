import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-magic-login";
import { AuthService } from "./auth.service";
import { MailerService } from "src/mailer/mailer.service";

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(MagicLoginStrategy.name);
    constructor(private authService: AuthService, private readonly mailerService: MailerService) {
        super({
            secret: process.env.MAGICLINK_SECRET,
            jwtOptions: {
                expiresIn: "1d",

            }
            ,
            callbackUrl: process.env.MAGICLINK_LOGIN_CALLBACK_URL,
            // confirmationUrl: process.env.MAGICLINK_CONFIRMATION_URL,
            sendMagicLink: async (destination, href, a) => {

                // TODO: send magic link to email
                // console.log('sendMagicLink:', destination, href);
                this.mailerService.sendUserLoginLink({ email: destination }, href);
                // this.logger.log(`Sending magic link to ${destination} with href ${href}`);

            },
            verify: async (payload, callback) => {
                callback(null, this.validate(payload));
            }

        });
    }
    validate(payload: { destination: string }) {
        // TODO: validate email address

        const user = this.authService.validateUser(payload.destination);

        return user
    }
}