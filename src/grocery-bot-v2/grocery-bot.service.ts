import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { Action } from './dto/completion-body.dto';

@Injectable()
export class GroceryBotService {

    async editCartCompletion(completionMessage: ChatCompletionMessageParam[], cart: { name: string; quantity: string }[], lastAction: Action) {

        const currentMessage = completionMessage[completionMessage.length - 1].content;

        let messageContent = ''


        let massages: ChatCompletionMessageParam[] = [
            { role: 'user', content: currentMessage },
        ]

        if (['add to cart', 'remove from cart', 'add x', 'remove x'].includes(lastAction?.action)
            && lastAction?.action !== 'clear cart') {
            massages.unshift({ role: 'system', content: `I added: ${lastAction?.list?.map(item => `${item.quantity} ${item.name} `)}` })
        }


        console.log('lastAction', lastAction);


        console.log('massages', massages);


        const response = await this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: massages,
            // max_tokens: 1,
            temperature: 0.9,
            functions: [
                {
                    name: "say-hallo",
                    description: "if the user is saying hallo",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ['user saying hallo', 'user asking how are you'] },
                        },
                        "required": ["action"],
                    },
                },
                {
                    name: "yes_no",
                    description: "return yes or no depending on the user answer",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ["yes", "no"] },
                        },
                        "required": ["action"],

                    },
                },
                {
                    name: "get-added-items",
                    description: "add or remove from cart and gat the items that was added or removed from the original cart",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ['add to cart', 'remove from cart', 'user asks is product available?', 'show cart'] },
                            "list": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": { "type": "string" },
                                        "quantity": { "type": "number" },
                                        "unit": { "type": "string" },
                                    }
                                }
                            },
                        },
                        "required": ["action"],
                    },

                },
                {
                    name: "get-one-more",
                    description: "add or remove x more",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ["add x", " remove x"] },
                            "list": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": { "type": "string" },
                                        "quantity": { "type": "number" },
                                        "unit": { "type": "string" },
                                    }
                                }
                            },
                        },
                        "required": ["action"],
                    },
                },
                // {
                //     name: "get-recipe",
                //     description: "user asks for a recipe",
                //     parameters: {
                //         recipe: {
                //             "type": "string",
                //             "name": "string",
                //         }
                //     }
                // }
            ]


        })

        const responseMessage = response.choices[0].message;

        if (responseMessage.function_call) {


            const functionArgs = JSON.parse(responseMessage.function_call.arguments);

            if (functionArgs.action === 'user asks is product available?' && functionArgs.list?.length > 0) {
                const items = await this.findOneItemInCatalog(functionArgs.list[0]?.name);
                functionArgs.list[0].isAvailable = items.length > 0;
            }

            if (['add to cart', 'add x'].includes(functionArgs.action)) {
                console.log('functionArgs', functionArgs);

                const availableItemsMap = await this.findItemsInCatalog(functionArgs.list.map(item => item.name))
                console.log('availableItemsMap', availableItemsMap);
                functionArgs.list = functionArgs.list.map(item => {
                    return {
                        ...item,
                        name: availableItemsMap[item.name][0] ? availableItemsMap[item.name][0]?.name : item.name,
                        isAvailable: availableItemsMap[item.name].length > 0,
                        alternatives: availableItemsMap[item.name],
                        price: availableItemsMap[item.name][0] ? availableItemsMap[item.name][0]?.price : null,
                    }
                })

            }

            return functionArgs;
        }

    }



    async editCartCompletionHebrew(completionMessage: ChatCompletionMessageParam[], cart: { name: string; quantity: string }[], lastAction: Action) {

        const currentMessage = completionMessage[completionMessage.length - 1].content;

        let messageContent = ''

        if (['add to cart', 'remove from cart', 'add x', 'remove x'].includes(lastAction?.action)
            && lastAction?.action !== 'clear cart') {
            messageContent = messageContent.concat(`This was the last action: ${JSON.stringify(lastAction)}`)
        }

        messageContent = messageContent.concat(`${currentMessage}`)

        console.log('messageContent', messageContent);

        let massages: ChatCompletionMessageParam[] = [
            { role: 'user', content: currentMessage },
        ]


        const response = await this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: massages,
            // max_tokens: 1,
            temperature: 0.9,
            functions: [
                {
                    name: "say-hallo",
                    description: "שהמשתמש אומר שלום",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ['user saying hallo', 'user asking how are you'] },
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
                    name: "yes_no",
                    description: "החזר 'כן' או 'לא' בהתאם לתשובת המשתמש",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ["yes", "no"] },
                        },
                        // "required": ["location"],
                    },
                },
                {
                    name: "get-added-items",
                    description: "הוסף לעגלה וקבל את הפריטים שנוספו או הוסרו מהעגלה המקורית",
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": ['add to cart', 'remove from cart', 'user asks is product available?'] },
                            "list": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": { "type": "string" },
                                        "quantity": { "type": "number" },
                                        "unit": { "type": "string" },
                                    }
                                }
                            },
                        },
                        // "required": ["location"],
                    },

                },
                {
                    name: "get-one-more",
                    description: "הוסף או הסר x נוספים",
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


    getOpenAI(): OpenAI {

        return new OpenAI({

            apiKey: process.env.OPENAI_API_KEY_YOSI,
        });

    }

    async findItemsInCatalog(itemNames: string[]) {
        const items = await this.getMockItemsFromFS()
        const itemsMap = {}
        itemNames.forEach((name) => {
            itemsMap[name] = this.findItemInCatalog(name, items)
        })
        return itemsMap;
    }

    async findOneItemInCatalog(name: string) {
        const items = await this.getMockItemsFromFS()
        this.findItemInCatalog(name, items)
        return items;
    }

    findItemInCatalog(name: string, items) {

        return items.filter((item) => item.name?.toLowerCase()?.includes(name.toLowerCase()))
    }


    async getMockItemsFromFS(): Promise<any[]> {
        const fs = require('fs').promises;

        // Specify the path to the JSON file
        const filePath = './src/grocery-data/mock-db.json';

        try {
            // Read the file asynchronously
            const data = await fs.readFile(filePath, 'utf8');

            // Parse the JSON string to an object
            const jsonObject = JSON.parse(data);

            // console.log(jsonObject);
            return jsonObject;
        } catch (err) {
            console.error('Error reading the file:', err);
            return [];
        }
    }
}
