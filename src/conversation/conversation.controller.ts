import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConversationService } from './conversation.service';
import { ChatCompletionRequestMessage } from 'openai';
import { IncomingMessage } from 'http';
import { error } from 'console';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {
  }

  @Post()
  chatCompletion(@Body() completionMessage: ChatCompletionRequestMessage[]) {
    return this.conversationService.chatWithAI(completionMessage);
  }

  @Post('streaming')
  async chatCompletionStreaming(@Res() res: Response, @Body() completionMessage: ChatCompletionRequestMessage[]) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    const stream = (await this.conversationService.chatCompletionStreaming(completionMessage));
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
