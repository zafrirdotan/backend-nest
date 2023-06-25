import { Body, Controller, Get, Post, Query, Res, Sse } from '@nestjs/common';
import { Response } from 'express';
import { ConversationService } from './conversation.service';
import { UserPromptDto } from './dto/user-prompt.dto';
import { Observable, tap } from 'rxjs';
import { ChatCompletionRequestMessage } from 'openai';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {
  }

  // @Post()
  // testTalkToAI() {
  //   console.log("Hello world");

  // }

  @Post()
  talkToAI(@Body() completionMessage: ChatCompletionRequestMessage[]) {
    return this.conversationService.chatWithAI(completionMessage);
  }

  @Post('start')
  startChat(@Body() userPrompt: UserPromptDto): string {
    this.conversationService.startChat(userPrompt);
    return 'Chat started.';
  }

  @Sse('stream')
  streamChat(@Res() res: Response): Observable<MessageEvent> {


    return this.conversationService.getStream();
  }

  @Get('stop')
  stopChat(): string {
    // this.conversationService.stopChat();
    return 'Chat stopped.';
  }

  @Post('avatar')
  talkToAvatar(@Body() userPrompt: UserPromptDto) {
    return this.conversationService.talkToAvatar(userPrompt);
  }

}
