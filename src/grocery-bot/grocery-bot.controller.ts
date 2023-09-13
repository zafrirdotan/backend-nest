import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CompletionBody, GrocerySumBody } from 'src/conversation/dto/completion-body.dto';
import e, { Response, Request } from 'express';
import { ConversationService } from 'src/conversation/conversation.service';
import { Subject, concatMap, delay, filter, from, fromEvent, map, of, scan } from 'rxjs';
import { mockData } from './mock-data';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

@Controller('api/grocery-bot')
export class GroceryBotController {
    constructor(private readonly conversationService: ConversationService) { }

    @Post('streaming')
    async chatCompletionStreaming(@Res() res: Response, @Body() completionBody: GrocerySumBody, @Req() req: Request) {

        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Connection', 'keep-alive');

        res.flushHeaders(); // flush the headers to establish SSE with client
        const completionMessage = completionBody.messages;
        // completionMessage.unshift({ "role": "system", "content": "You are a helpful assistant for buying grocery in the supermarket." },
        //     { "role": "system", "content": "if someone some one asks to add to the card always replay with a list in the requested language" },
        //     { "role": "system", "content": "if someone chats about a deferent subject replay that you are only a shopping assistant" }
        // )

        const massages: ChatCompletionMessageParam[] = [
            { "role": "system", "content": "You are a helpful assistant for buying grocery in the supermarket." },
            { "role": "system", "content": "if someone some one asks to add to the card always replay with a list in the requested language" },
            { "role": "system", "content": "if someone chats about a deferent subject replay that you are only a shopping assistant" },
            // completionMessage[completionMessage.length - 3],
            // completionMessage[completionMessage.length - 2],
            { "role": "user", "content": `this is the original cart: ${JSON.stringify(completionBody.cart)} .Do this: ${completionMessage[completionMessage.length - 1].content} and return regular text` },
        ]

        const stream = (await this.conversationService.chatCompletionStreaming(massages));

        for await (const part of stream) {
            res.write(part.choices[0].delta.content || '')
        }

        res.end();
    }



    @Post('summery-streaming')
    async getGrocerySummeryStreaming(@Res() res: Response, @Body() completionBody: CompletionBody, @Req() req: Request) {

        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Connection', 'keep-alive');

        res.flushHeaders(); // flush the headers to establish SSE with client
        const completionMessage = completionBody.messages;

        completionMessage.unshift({ "role": "user", "content": 'Generate a JSON object that will contain grocery item in this format: [{"name": "appels", "quantity": 4}]. Do not add text before and after the json object' })

        // completionMessage.unshift({ "role": "system", "content": 'You should output strictly JSON-formatted data.' })
        // completionMessage.unshift({ "role": "system", "content": 'return me a list of grocery items in this JSON format: [{"name": "appels", "quantity": 4}].' })

        const stream = (await this.conversationService.JSONStreaming(completionMessage));

        const stream$ = from(stream).pipe(map((part) => part.choices[0].delta.content || ''))

        // for await (const part of stream) {
        //     stream$.next(part.choices[0].delta.content || '')

        // }
        // const mockChunks = from(mockData).pipe(concatMap(item => of(item).pipe(delay(10))))


        // return
        let isArrayStart = false;
        let isArrayFinish = false;
        let accumulator = '';
        stream$.pipe(
            filter(chunk => {

                // if chunk is falsy, return false
                if (chunk === '') {
                    return false;
                }

                // if chunk is '[', set isArrayStart to true and return true


                if (!isArrayStart && (chunk.includes('['))) {
                    isArrayStart = true;
                    return true;

                } else if (isArrayStart && (chunk.includes(']'))) {
                    isArrayFinish = true;
                    return true;
                }

                const shouldReturn = isArrayStart && !isArrayFinish;
                return shouldReturn;
            }),
            map(chunk => {

                accumulator += chunk;
                // console.log('accumulator', accumulator.trim());
                const objectStartIndex = accumulator.indexOf('{');
                const objectEndIndex = accumulator.indexOf('}');

                if (objectStartIndex !== -1 && objectEndIndex !== -1) {
                    const returnValue = accumulator.slice(objectStartIndex, objectEndIndex + 1);
                    accumulator = '';
                    return returnValue;
                }
            }),

            filter(Boolean),
        )
            .subscribe({
                next: (chunk) => {
                    console.log('chunk', chunk);
                    // console.log('remainder', remainder);
                    res.write(chunk || '')
                }, error: (err) => {
                    console.log('err', err);

                }, complete: () => {
                    res.end();
                }
            })

    }


    @Post('description')
    async getDescription(@Body() completionBody: CompletionBody) {
        console.log('completionBody', completionBody);
        const completionMessage = completionBody.messages;
        const descriptions = {
            1: 'add to cart',
            2: 'remove from cart',
            3: 'show cart',
            4: 'show summery',
            5: 'clear cart',
            6: 'exit'
        }
        const descriptionsString = Object.values(descriptions).join('\n');
        const completion = await this.conversationService.getDescription(completionMessage, descriptionsString);
        console.log('completion', completion);

        return { selectedOption: completion.choices[0].message.content }
    }


    @Post('list')
    async getItems(@Body() completionBody: CompletionBody) {
        console.log('completionBody', completionBody);
        const messages = completionBody.messages;
        messages.unshift({ "role": "system", "content": 'Sum the items in all massages and Generate a JSON object that will contain grocery item in this format: [{"name": "appels", "quantity": 4}]' })

        const completion = await this.conversationService.getCompletion(messages);
        console.log('completion.choices[0].message.content', completion.choices[0].message.content);
        return { content: completion.choices[0].message.content }
    }

    @Post('list-function')
    getCompletionWithFunctions(@Body() completionBody: GrocerySumBody) {

        return this.conversationService.sumTheCart(completionBody.messages, completionBody.cart, completionBody.lastAction);
    }

}

