import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class HttpOnlyCookieAuthGuard extends AuthGuard('jwt') implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        // console.log('body:', context.switchToHttp().getRequest().body);
        // console.log('cookie:', context.switchToHttp().getRequest().cookies);
        const request = context.switchToHttp().getRequest();
        const cookieToken = request.cookies?.token;

        const isFirstMassage = !cookieToken?.temp_user_access_token?.length && !cookieToken?.access_token?.length;
        // if (isFirstMassage) {
        //     return true
        // }


        return super.canActivate(context);
    }

}