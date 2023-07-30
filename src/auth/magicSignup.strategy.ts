import { HttpException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-magic-login";
import { AuthService } from "./auth.service";
import { MailerService } from "src/mailer/mailer.service";

@Injectable()
export class MagicSignupStrategy extends PassportStrategy(Strategy, 'magicSignup') {
    private readonly logger = new Logger(MagicSignupStrategy.name);
    constructor(private authService: AuthService, private readonly mailerService: MailerService) {
        super({
            secret: process.env.MAGICLINK_SECRET,
            jwtOptions: {
                expiresIn: "1d",
            }
            ,
            callbackUrl: process.env.MAGICLINK_SIGNUP_CALLBACK_URL,
            confirmationUrl: process.env.MAGICLINK_CONFIRMATION_URL,
            sendMagicLink: async (destination, href) => {
                // TODO: send magic link to email
                // console.log('sendMagicLink:', destination, href);
                this.mailerService.sendUserSignupLink({ email: destination }, href);
                // this.logger.log(`Sending magic link to ${destination} with href ${href}`);

            },

            verify: async (payload, callback) => {
                callback(null, this.validate(payload));
            }

        });
    }

    async validate(payload: { destination: string }) {

        if (payload.destination) {
            const user = await this.authService.findUserByEmail(payload.destination);

            if (!user) {
                return { email: payload.destination };
            } else {
                throw new HttpException('User already exists', 400);

            }
        } else {
            throw new UnauthorizedException
        }

    }
}