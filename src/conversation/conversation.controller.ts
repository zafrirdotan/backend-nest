import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConversationService } from './conversation.service';
import { CompletionBody } from './dto/completion-body.dto';

@Controller('api/conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // @UseGuards(AuthGuard('jwt-allow-3-first'))
  @Post('streaming')
  async chatCompletionStreaming(
    @Res() res: Response,
    @Body() completionBody: CompletionBody,
    @Req() req: Request,
  ) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders(); // flush the headers to establish SSE with client

    const stream = await this.conversationService.chatCompletionStreaming(
      completionBody.messages,
    );

    for await (const part of stream) {
      res.write(part.choices[0].delta.content || '');
    }
    res.end();
  }

  @Post('question-summery')
  async getCompletion(@Res() res: Response, @Body() data: { prompt: string }) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client
  }
}
