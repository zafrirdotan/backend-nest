import { Module } from '@nestjs/common';
import { GroceryBotController } from './grocery-bot.controller';
import { ConversationService } from 'src/conversation/conversation.service';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  controllers: [GroceryBotController],
  providers: [ConversationService],
  imports: [ConversationModule],

})
export class GroceryBotModule { }
