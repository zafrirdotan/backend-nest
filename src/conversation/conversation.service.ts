import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { from, fromEvent } from 'rxjs';
import { json } from 'stream/consumers';
import { Action } from './dto/completion-body.dto';


@Injectable()
export class ConversationService {


    async chatCompletionStreaming(completionMessage: ChatCompletionMessageParam[]): Promise<IncomingMessage> {
        // Note: you should replace 'prompt' and 'max_tokens' with your actual values.

        const completion = await this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: completionMessage,
            // functions: [],
            temperature: 0.9,
            // max_tokens: 20,
            stream: true,
        });

        return completion as unknown as IncomingMessage;

    }

    async JSONStreaming(completionMessage: ChatCompletionMessageParam[]) {
        // Note: you should replace 'prompt' and 'max_tokens' with your actual values.

        return this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: completionMessage,
            temperature: 0.9,
            // max_tokens: 200,
            stream: true,
        });

    }

    getDescription(completionMessage: ChatCompletionMessageParam[], descriptions: string) {


        const prompt = `Choose the best description for the following text:\n"${completionMessage[0].content}"\nOptions:\n1. ${descriptions}\n.Answer with a number: `;

        return this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 1,
            temperature: 0.9,
        })
    }

    getCompletion(messages: ChatCompletionMessageParam[]) {

        return this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages,
            // max_tokens: 1,
            temperature: 0.9,
        })
    }

    async sumTheCart(completionMessage: ChatCompletionMessageParam[], cart: { name: string; quantity: string }[], lastAction: Action) {
        let messageContent = ''

        if (['add to cart', 'remove from cart', 'add x', 'remove x'].includes(lastAction?.action)) {
            messageContent = messageContent.concat(`This was the last action: ${JSON.stringify(lastAction)}`)
        }

        messageContent = messageContent.concat(`Do this: ${completionMessage[completionMessage.length - 1].content}, and return just the added ones`)


        const massages: ChatCompletionMessageParam[] = [
            // { role: 'system', content: 'You are a shopping cart assistant' },
            { role: 'user', content: messageContent },
        ]

        const response = await this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: massages,
            // max_tokens: 1,
            temperature: 0.9,
            functions: [
                {
                    name: "get-added-items",
                    description: "add to cart and gat the items that was added or removed from the original cart",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ["add to cart", "remove from cart", "saying hallo", "clear cart", "something else"] },
                            "list": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": { "type": "string" },
                                        "quantity": { "type": "number" },
                                        "scale": { "type": "string" },
                                    }
                                }
                            },
                        },
                        // "required": ["location"],
                    },

                },
                {
                    name: "get-one-more",
                    description: "add or remove x more",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ["add x", " remove x"] },
                            "quantity": { "type": "number" },
                            "name": { "type": "string" },
                        },
                        // "required": ["location"],
                    },

                },

            ]


        })

        const responseMessage = response.choices[0].message;

        if (responseMessage.function_call) {

            const functionArgs = JSON.parse(responseMessage.function_call.arguments);

            return functionArgs;
        }

    }

    async getCompletionWithFunctions(completionMessage: ChatCompletionMessageParam[], descriptions: string) {

        const description = `Summery the chat, Choose the best description the following text:\n"${completionMessage[0].content}"\nOptions:\n1. ${descriptions}\n and return the items it was done on: `;

        const response = await this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: [
                { role: 'user', content: completionMessage[0].content }
            ],
            // max_tokens: 1,
            temperature: 0.9,
            functions: [
                {
                    name: "edit_list",
                    description: description,
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ["add to cart", "remove from cart", "saying hallo", "something else"] },
                            "list": {
                                "type": "array", "items": {
                                    "type": "object", "properties": {
                                        "name": { "type": "string" },
                                        "quantity": { "type": "number" },
                                        "scale": { "type": "string" },
                                    }
                                }
                            },
                        },
                        // "required": ["location"],
                    },

                },

            ]


        })

        const responseMessage = response.choices[0].message;

        if (responseMessage.function_call) {
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);
            const { action, list } = functionArgs;
            console.log('functionArgs', functionArgs);

            return functionArgs;
        }
    }

    edit_list = (action, list) => {
        console.log('action', action);
        console.log('list', list);

        return 'sum_items'
    }

    getOpenAI(): OpenAI {

        return new OpenAI({
            organization: "org-X0n7hfF6tJjf4a3wkduvdzGS",
            apiKey: process.env.OPENAI_API_KEY_YOSI,
        });

    }



}
