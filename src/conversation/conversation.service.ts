import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { Subject } from 'rxjs';


@Injectable()
export class ConversationService {
    stream = new Subject<MessageEvent>();

    async chatWithAI(completionMessage: ChatCompletionRequestMessage[]) {
        const stattTime = Date.now();
        const responseMessage = await this.getChatCompletion(completionMessage);

        const response = { message: responseMessage, summery: undefined };
        // Is the it the start of the conversation?
        if (completionMessage.length === 1) {
            response.summery = await this.getCompletion(completionMessage[0].content);
        }
        console.log('end time', Date.now() - stattTime);
        return response;
    }

    async getChatCompletion(completionMessage: ChatCompletionRequestMessage[]) {

        const completion = await this.getOpenAI().createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: completionMessage,
            temperature: 0.9,
            max_tokens: 200,
            user: "user-1234",
        });

        return completion.data.choices[0].message;
    }

    async getCompletion(prompt: string): Promise<IncomingMessage> {
        const completion = await this.getOpenAI().createCompletion({
            model: "text-davinci-003",
            prompt: `summarize 6 words: ${prompt}`,
            max_tokens: 7,
            temperature: 0,
            stream: true,
        }, { responseType: 'stream' });

        return completion.data as unknown as IncomingMessage;

    }

    async chatCompletionStreaming(completionMessage: ChatCompletionRequestMessage[]): Promise<IncomingMessage> {
        // Note: you should replace 'prompt' and 'max_tokens' with your actual values.
        const completion = await this.getOpenAI().createChatCompletion({
            model: "gpt-3.5-turbo-0613",
            messages: completionMessage,
            temperature: 0.9,
            // max_tokens: 200,
            stream: true,
        }, { responseType: 'stream' });

        return completion.data as unknown as IncomingMessage;

    }


    getOpenAI(): OpenAIApi {

        const configuration = new Configuration({
            organization: "org-X0n7hfF6tJjf4a3wkduvdzGS",
            apiKey: process.env.OPENAI_API_KEY_YOSI,

        });

        return new OpenAIApi(configuration);
    }



}
