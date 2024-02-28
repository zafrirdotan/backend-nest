import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { ConfigModule } from '@nestjs/config';
import { PluginModule } from './plugin/plugin.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
// import { MongooseModule } from '@nestjs/mongoose';
import { GroceryBotModuleV2 } from './grocery-bot-v2/grocery-bot.module';

@Module({
  imports: [
    ConversationModule,
    ConfigModule.forRoot(),
    PluginModule,
    UsersModule,
    AuthModule,
    MailerModule,
    // MongooseModule.forRoot(
    //   process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-bot',
    // ),
    GroceryBotModuleV2,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
