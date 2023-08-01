import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({ credentials: true, origin: 'http://localhost:4200' });
  app.use(helmet());
  // Custom middleware that applies the CSP only to the root path
  // app.use((req, res, next) => {
  //   if (req.path === '/chat' || req.path === '') { // Apply only to the root path
  //     cspOptions(req, res, next);
  //   } else {
  //     next();
  //   }
  // });

  app.useStaticAssets(join(__dirname, '..', '../frontend-angular/dist/open-ai-frontend'));
  await app.listen(3000);
}
bootstrap();


// Define your CSP options here
// const cspOptions = helmet.contentSecurityPolicy({
//   directives: {
//     ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//     "script-src-attr": ["'self'", "'unsafe-inline'"], // Modify this to suit your needs
//   },
// });
