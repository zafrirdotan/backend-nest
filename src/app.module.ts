import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
import { GroceryBotModuleV2 } from './grocery-bot-v2/grocery-bot.module';

@Module({
  imports: [
    ConversationModule,
    ConfigModule.forRoot(),
    // MongooseModule.forRoot(
    //   process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-bot',
    // ),
    GroceryBotModuleV2,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
