import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConversationService } from './conversation.service';
import { ChatCompletionRequestMessage } from 'openai';
import { Request } from 'express';
import { CompletionBody } from './dto/completion-body.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { TempUser } from 'src/auth/entitys/temp-user.entity';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService, private authService: AuthService) {
  }

  @Post()
  chatCompletion(@Body() completionMessage: ChatCompletionRequestMessage[]) {
    return this.conversationService.chatWithAI(completionMessage);
  }

  @UseGuards(AuthGuard('jwt-allow-3-first'))
  @Post('streaming')
  async chatCompletionStreaming(@Res() res: Response, @Body() completionBody: CompletionBody, @Req() req: Request) {

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');

    if (req.user?.hasOwnProperty('type') && (req.user as TempUser)?.type === 'temp_user') {
      const tempUser = req.user as TempUser;
      if (tempUser?.type === 'temp_user') {
        const newTempToken = await this.authService.refreshTempUserToken(tempUser);
        res.cookie('token', newTempToken, {
          httpOnly: true,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        });
      }
    }

    res.flushHeaders(); // flush the headers to establish SSE with client

    const stream = (await this.conversationService.chatCompletionStreaming(completionBody.messages));
    stream.on('data', (data) => {

      const lines = data.toString().split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {

        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          res.end();
          return
        }
        if (message) {
          try {
            const parsed = JSON.parse(message);
            if (parsed?.choices && parsed.choices[0]?.delta?.content) {

              res.write(parsed.choices[0].delta.content)
            }
          } catch (e) {
            console.log('error in streaming chat compilation:', e)
            console.log('line:', line)

            console.log('message:', message)
          }
        }
      }
    });

    stream.on('end', () => {
      res.end();
    });
  }

  @Post('question-summery')
  async getCompletion(@Res() res: Response, @Body() data: { prompt: string }) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    const stream = (await this.conversationService.getCompletion(data.prompt));
    stream.on('data', (data) => {

      const lines = data.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          res.end();
          return
        }
        if (message) {
          try {
            const parsed = JSON.parse(message);
            const choices = parsed?.choices;
            if (choices && choices[0]?.text) {

              res.write(parsed.choices[0].text)
            }
          } catch (e) {
            console.log('error in streaming compilation:', e, 'message:', message)

          }
        }
      }
    });

    stream.on('end', () => {
      res.end();
    });

  }
}
