import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { from, fromEvent } from 'rxjs';
import { json } from 'stream/consumers';
import { Action } from './dto/completion-body.dto';

@Injectable()
export class ConversationService {
  async chatCompletionStreaming(
    completionMessage: ChatCompletionMessageParam[],
  ): Promise<IncomingMessage> {
    // Note: you should replace 'prompt' and 'max_tokens' with your actual values.

    const completion = await this.getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: completionMessage,
      // functions: [],
      temperature: 0.9,
      max_tokens: 100,
      stream: true,
    });

    return completion as unknown as IncomingMessage;
  }

  async JSONStreaming(completionMessage: ChatCompletionMessageParam[]) {
    // Note: you should replace 'prompt' and 'max_tokens' with your actual values.

    return this.getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: completionMessage,
      temperature: 0.9,
      // max_tokens: 200,
      stream: true,
    });
  }

  getDescription(
    completionMessage: ChatCompletionMessageParam[],
    descriptions: string,
  ) {
    const prompt = `Choose the best description for the following text:\n"${completionMessage[0].content}"\nOptions:\n1. ${descriptions}\n.Answer with a number: `;

    return this.getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1,
      temperature: 0.9,
    });
  }

  getCompletion(messages: ChatCompletionMessageParam[]) {
    return this.getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages,
      // max_tokens: 1,
      temperature: 0.9,
    });
  }

  async editCartCompletion(
    completionMessage: ChatCompletionMessageParam[],
    cart: { name: string; quantity: string }[],
    lastAction: Action,
  ) {
    const currentMessage =
      completionMessage[completionMessage.length - 1].content;

    let messageContent = '';

    let massages: ChatCompletionMessageParam[] = [
      { role: 'user', content: currentMessage },
    ];

    if (
      ['add to cart', 'remove from cart', 'add x', 'remove x'].includes(
        lastAction?.action,
      ) &&
      lastAction?.action !== 'clear cart'
    ) {
      massages.unshift({
        role: 'system',
        content: `I added: ${lastAction?.list?.map(
          (item) => `${item.quantity} ${item.name} `,
        )}`,
      });
    }

    console.log('lastAction', lastAction);

    console.log('massages', massages);

    const response = await this.getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: massages,
      // max_tokens: 1,
      temperature: 0.9,
      functions: [
        {
          name: 'say-hallo',
          description: 'if the user is saying hallo',
          parameters: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['user saying hallo', 'user asking how are you'],
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'yes_no',
          description: 'return yes or no depending on the user answer',
          parameters: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['yes', 'no'] },
            },
            required: ['action'],
          },
        },
        {
          name: 'get-added-items',
          description:
            'add to cart and gat the items that was added or removed from the original cart',
          parameters: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'add to cart',
                  'remove from cart',
                  'user asks is product available?',
                ],
              },
              list: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                  },
                },
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'get-one-more',
          description: 'add or remove x more',
          parameters: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['add x', ' remove x'] },
              list: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                  },
                },
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'get-recipe',
          description: 'user asks for a recipe',
          parameters: {
            recipe: {
              type: 'string',
              name: 'string',
            },
          },
        },
      ],
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      console.log(
        'responseMessage.function_call',
        responseMessage.function_call,
      );

      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      return functionArgs;
    }
  }

  async editCartCompletionHebrew(
    completionMessage: ChatCompletionMessageParam[],
    cart: { name: string; quantity: string }[],
    lastAction: Action,
  ) {
    const currentMessage =
      completionMessage[completionMessage.length - 1].content;

    let messageContent = '';

    if (
      ['add to cart', 'remove from cart', 'add x', 'remove x'].includes(
        lastAction?.action,
      ) &&
      lastAction?.action !== 'clear cart'
    ) {
      messageContent = messageContent.concat(
        `This was the last action: ${JSON.stringify(lastAction)}`,
      );
    }

    messageContent = messageContent.concat(`${currentMessage}`);

    console.log('messageContent', messageContent);

    let massages: ChatCompletionMessageParam[] = [
      { role: 'user', content: currentMessage },
    ];

    const response = await this.getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: massages,
      // max_tokens: 1,
      temperature: 0.9,
      functions: [
        {
          name: 'say-hallo',
          description: 'שהמשתמש אומר שלום',
          parameters: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['user saying hallo', 'user asking how are you'],
              },
            },
            // "required": ["location"],
          },
        },
        // {
        //     name: "add-something",
        //     description: "הלקוח רוצה להוסיף משהו לסל אבל לא אומר מה",
        //     parameters: {
        //         "type": "object",
        //         "properties": {
        //             "action": { "type": "string", "enum": ["doesn't specify what he wants"] },
        //         },
        //         // "required": ["location"],
        //     },
        // },

        {
          name: 'yes_no',
          description: "החזר 'כן' או 'לא' בהתאם לתשובת המשתמש",
          parameters: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['yes', 'no'] },
            },
            // "required": ["location"],
          },
        },
        {
          name: 'get-added-items',
          description:
            'הוסף לעגלה וקבל את הפריטים שנוספו או הוסרו מהעגלה המקורית',
          parameters: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'add to cart',
                  'remove from cart',
                  'user asks is product available?',
                ],
              },
              list: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                  },
                },
              },
            },
            // "required": ["location"],
          },
        },
        {
          name: 'get-one-more',
          description: 'הוסף או הסר x נוספים',
          parameters: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['add x', ' remove x'] },
              quantity: { type: 'number' },
              name: { type: 'string' },
            },
            // "required": ["location"],
          },
        },
      ],
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      return functionArgs;
    }
  }

  edit_list = (action, list) => {
    console.log('action', action);
    console.log('list', list);

    return 'sum_items';
  };

  getOpenAI(): OpenAI {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}
