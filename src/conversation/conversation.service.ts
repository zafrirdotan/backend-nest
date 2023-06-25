import { Injectable } from '@nestjs/common';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { UserPromptDto } from './dto/user-prompt.dto';
import { Observable, Subject, of } from 'rxjs';
import { IncomingMessage } from 'http';




@Injectable()
export class ConversationService {
    stream = new Subject<MessageEvent>();

    async chatWithAI(completionMessage: ChatCompletionRequestMessage[]) {
        const responseMessage = await this.sendRegularMessage(completionMessage);

        const response = { message: responseMessage, summery: undefined };
        // Is the it the start of the conversation?
        if (completionMessage.length === 1) {
            response.summery = await this.getCompletion(completionMessage[0].content);
        }
        return response;
    }

    async sendRegularMessage(completionMessage: ChatCompletionRequestMessage[]) {

        const completion = await this.getOpenAI().createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: completionMessage,
            temperature: 0.9,
            max_tokens: 200,
            user: "user-1234",
        });
        console.log('completion.data: ', completion.data);

        console.log(completion.data.choices);
        return completion.data.choices[0].message;
    }

    async getCompletion(massage: string): Promise<string> {
        const response = await this.getOpenAI().createCompletion({
            model: "text-davinci-003",
            prompt: `What is the subject of massage in up to 6 words: ${massage}`,
            max_tokens: 7,
            temperature: 0,
        });

        return response.data.choices[0].text;

    }


    talkToAI(prompt: UserPromptDto) {
        // return { content: 'mock response', role: 'assistant' };
        // Define the conversation
        const completionMessage: ChatCompletionRequestMessage[] = [
            { role: 'system', content: prompt.isFirstMessage ? 'Starting a new conversation.' : null },
            { role: 'user', content: prompt.messages },
            { role: 'assistant', content: 'Cawabanga' }
        ];
        if (prompt.isFirstMessage) {
            completionMessage.push({ role: 'system', content: 'Starting a new conversation.' })
        }

        return this.sendRegularMessage(completionMessage);

    }

    talkToAvatar(prompt: UserPromptDto) {
        const completionMessage: ChatCompletionRequestMessage[] = [
            {
                role: 'system', content: "Act as if are a real person and you'r name is Or Den, a 34-year-old software developer with 7 years of experience in web development. Your expertise is primarily in JavaScript and you have a strong focus on using Node.js for server-side development. Over the years, you've become adept at using Express.js for building web applications and are comfortable integrating databases such as MongoDB and PostgreSQL. You are also skilled in front-end development with extensive knowledge of front-end frameworks like React and Angular. Your experience includes deploying and maintaining web applications on platforms like AWS and Heroku, and you have proficiency in containerization with Docker. You fill great today!"
            },
            { role: 'user', content: prompt.messages },

        ];
        console.log("completionMessage", completionMessage);

        return this.sendRegularMessage(completionMessage)
    }



    async startChat(userPrompt: UserPromptDto) {

        // Define the conversation
        const conversation: ChatCompletionRequestMessage[] = [
            // { role: 'system', content: prompt.isFirstMessage ? 'Starting a new conversation.' : null },
            { role: 'user', content: userPrompt.messages },
            // { role: 'assistant', content: 'Hi! How can I assist you today?' }
        ];


        const completion = await this.getOpenAI().createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: conversation,
            temperature: 0.9,
            max_tokens: 200,
            user: "user-1234",
            stream: true,
        }, { responseType: 'stream' });

        const resStream = completion.data as unknown as IncomingMessage;

        resStream.on('data', (chunk: Buffer) => {
            const message = chunk.toString('utf-8');
            console.log("message", message);

            this.stream.next({ data: message } as MessageEvent);
        })

        resStream.on('end', () => {
            this.stream.complete();
        });

        resStream.on('error', (error: any) => {
            this.stream.error(error);
        });

    }

    getStream(): Observable<MessageEvent> {
        return this.stream;
    }


    getOpenAI(): OpenAIApi {

        const configuration = new Configuration({
            organization: "org-X0n7hfF6tJjf4a3wkduvdzGS",
            apiKey: process.env.OPENAI_API_KEY_YOSI,

        });

        return new OpenAIApi(configuration);
    }

}
