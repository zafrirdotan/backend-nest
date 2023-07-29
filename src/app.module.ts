import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { ConfigModule } from '@nestjs/config';
import { PluginModule } from './plugin/plugin.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({

  imports: [ConversationModule, ConfigModule.forRoot(), PluginModule, UsersModule, AuthModule, MailerModule, MongooseModule.forRoot('mongodb+srv://ZafrirDotan:J2ppBZs0Zak906LJ@zafriraicluster.qy9ouux.mongodb.net/?retryWrites=true&w=majority')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


