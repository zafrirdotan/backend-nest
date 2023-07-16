import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { ConfigModule } from '@nestjs/config';
import { PluginModule } from './plugin/plugin.module';

@Module({
  imports: [ConversationModule, ConfigModule.forRoot(), PluginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
