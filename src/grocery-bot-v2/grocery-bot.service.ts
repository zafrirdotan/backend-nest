import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { UserAction, LastAction, GrocerySumBody, ICartItem } from './dto/completion-body.dto';
import { responseDictionary } from './crocery-bot-response-dictionary';
import { classifiedAs, classify, getMostSimilar } from 'src/utils/cosineSimilarity';
import * as fs from 'fs';
import { TextToEmbed, getMockData } from './mock-data';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './entity/product.entity';
import { MongoClient } from 'mongodb';

const descriptions = {
    sayHallo: {
        en: "if the user is saying hallo",
        he: "שהמשתמש אומר שלום",
    },
    yesNo: {
        en: "return yes or no depending on the user answer",
        he: "החזר 'כן' או 'לא' בהתאם לתשובת המשתמש",
    },
    addAndRemove: {
        en: "add or remove from cart and gat the items that was added or removed from the original cart",
        he: "הוסף לעגלה וקבל את הפריטים שנוספו או הוסרו מהעגלה המקורית",
    },
    addOrRemoveX: {
        en: "add or remove x more",
        he: "הוסף או הסר x נוספים",
    },

}


@Injectable()
export class GroceryBotService {

    constructor(@InjectModel('Product') private readonly productModel: Model<Product>) {
        // this.embedding();
        // this.findCosineSimilarity(['Garlic', 'mango', 'tomato', 'chocolate', 'עגבניה']);
        // this.setEmbeddingProductsMap();
    }

    async editCartCompletion(completionBody: GrocerySumBody) {
        // const classifiedAs = this.findCosineSimilarity(completionBody.message.content);
        // return { classifiedAs }
        // return
        const { message, cart, lastAction } = completionBody;
        let language = 'en';
        if (containsHebrew(message.content)) {
            language = 'he';
        }


        let massages: ChatCompletionMessageParam[] = [
            message,
        ]

        if ([UserAction.addToCart, UserAction.removeFromCart, UserAction.addX, UserAction.removeX].includes(lastAction?.action)
            && lastAction?.action !== UserAction.clearCart) {
            massages.unshift({ role: 'system', content: `I added: ${lastAction?.list?.map(item => `${item.quantity} ${item.name} `)}` })
        }


        // console.log('lastAction', lastAction);


        console.log('massages', massages);
        // console.log('language', language);


        const response = await this.getOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: massages,
            temperature: 0.9,
            functions: [
                {
                    name: "sayHallo",
                    description: descriptions.sayHallo[language],
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": [UserAction.hallo.toString(), UserAction.howAreYou.toString()] },
                        },
                        "required": ["action"],
                    },
                },
                {
                    name: "yesNo",
                    description: descriptions.yesNo[language],
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": [UserAction.yes, UserAction.no] },
                        },
                        "required": ["action"],

                    },
                },
                {
                    name: "addAndRemove",
                    description: descriptions.addAndRemove[language],
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": [UserAction.addToCart, UserAction.removeFromCart, UserAction.isProductAvailable, UserAction.showCart, UserAction.clearCart] },
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
                    name: "addOrRemoveX",
                    description: descriptions.addOrRemoveX[language],
                    parameters: {
                        "type": "object",
                        "properties": {
                            "action": { "type": "string", "enum": [UserAction.addX, UserAction.removeX] },
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

            ]


        })

        const responseMessage = response.choices[0].message;

        if (responseMessage.function_call) {

            const availableFunctions = {
                sayHallo: this.sayHallo.bind(this),
                yesNo: this.yesNo.bind(this),
                addAndRemove: this.addAndRemove.bind(this),
                addOrRemoveX: this.addOrRemoveX.bind(this),
            };


            // return functionArgs;
            const functionName = responseMessage.function_call.name;
            console.log('functionName', functionName);

            const functionToCall = availableFunctions[functionName];
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);
            const functionResponse = await functionToCall(
                functionArgs,
                cart,
                language,
                lastAction,
            );

            return functionResponse;

        }

    }

    sayHallo(args, cart?: any[]) {
        const { action } = args;
        if (action === UserAction.hallo) {
            return { role: 'system', content: 'Hallo' }
            // return { role: 'system', content: 'Hallo' , cart: cart , action: args.action, items: args.list }
        } else if (action === UserAction.howAreYou) {
            return { role: 'system', content: 'I am fine, thank you' }
        }
    }

    async addAndRemove(args, cart?: any[], language?: string) {
        let message: string = '';
        let updatedCart: ICartItem[] = cart;

        if (args.action === UserAction.addToCart) {
            console.log('args.list', args.list);
            const start = Date.now();
            const items = await this.getItemsAvailabilityAndAlternatives(args.list);
            const end = Date.now();
            console.log('time', end - start);
            const availableItems = items.filter((item: ICartItem) => item.isAvailable);
            const unavailableItems = items.filter((item: ICartItem) => !item.isAvailable);
            updatedCart = mergeArrays(cart, availableItems);
            message = responseDictionary.addingItemsToCart[language](availableItems, unavailableItems)
        } else if (args.action === UserAction.removeFromCart) {
            updatedCart = reduceArrays(cart, args.list);
            message = responseDictionary.removingItemsFromCart[language](args)
        } else if (args.action === UserAction.isProductAvailable) {

            const items = this.findItemInCatalog(args.list[0]?.name, cart);
            args.list[0].isAvailable = items.length > 0;
            message = responseDictionary.isProductAvailable[language](args)

        } else if (args.action === UserAction.showCart) {

            message = responseDictionary.showCart[language](args)
        } else if (args.action === UserAction.clearCart) {
            message = responseDictionary.clearCart[language](args)
            return { role: 'system', content: message, cart: updatedCart, action: UserAction.CartClearApproval, items: args.list }

        }
        else {

        }

        return { role: 'system', content: message, cart: updatedCart, action: args.action, items: args.list }

    }

    yesNo(args, _cart: any[], language: string, lastAction?: LastAction) {
        console.log('lastAction', lastAction);
        console.log('args', args);

        if (args.action === UserAction.yes) {
            if (lastAction.action === UserAction.CartClearApproval) {
                return { role: 'system', content: 'Your cart is empty', cart: [], action: UserAction.clearCart }
            }
        } else if (args.action === UserAction.no) {
            if (lastAction.action === UserAction.CartClearApproval) {
                return { role: 'system', content: "Ok, I didn't do anything", }
            }
        }
    }

    async addOrRemoveX(args, cart?: any[], language?: string, lastAction?: LastAction) {
        let message: string = '';
        let updatedCart: ICartItem[] = cart;

        if (args.action === UserAction.addX) {

            const items = await this.getItemsAvailabilityAndAlternatives(args.list);
            const availableItems = items.filter((item: ICartItem) => item.isAvailable);
            const unavailableItems = items.filter((item: ICartItem) => !item.isAvailable);
            updatedCart = mergeArrays(cart, availableItems);
            message = responseDictionary.addingItemsToCart[language](availableItems, unavailableItems)
        } else if (args.action === UserAction.removeX) {
            updatedCart = reduceArrays(cart, args.list);
            message = responseDictionary.removingItemsFromCart[language](args)
        } else {

        }

        return { role: 'system', content: message, cart: updatedCart, action: args.action, items: args.list }

    }

    async getItemsAvailabilityAndAlternatives(items) {
        // const availableItemsMap = await this.findItemsInCatalog(items.map(item => item.name))

        const similarKeywordMap = await this.findCosineSimilarity(items.map(item => item.name), 2);
        // console.log('similarKeywordMap', similarKeywordMap);

        // צקיך להתאים ביםן השם עום אות גדולה לששם עם אות קטנה 

        const keywords = Object.keys(similarKeywordMap);

        const similarKeywordArray = []

        keywords.forEach((keyword) => {
            similarKeywordMap[keyword].forEach((item) => {
                similarKeywordArray.push(item.key)
            })
        })

        const availableItemsMap2 = await this.findItemsInCatalogByName(similarKeywordArray)

        keywords.forEach((propertyName) => {
            // console.log('propertyName', propertyName);
            similarKeywordMap[propertyName] = similarKeywordMap[propertyName].map((item) => {
                return Object.assign(item, ...availableItemsMap2[item.key]);
            })
        })

        console.log('similarKeywordMap2', similarKeywordMap);


        return items.filter(item => item.name !== 'item').map(item => {

            return {
                ...item,
                name: similarKeywordMap[item.name][0] ? similarKeywordMap[item.name][0]?.name : item.name,
                isAvailable: similarKeywordMap[item.name].length > 0,
                alternatives: similarKeywordMap[item.name].slice(1, 3),
                price: similarKeywordMap[item.name][0] ? similarKeywordMap[item.name][0]?.price : null,
            }
        })
    }



    getOpenAI(): OpenAI {

        return new OpenAI({

            apiKey: process.env.OPENAI_API_KEY_YOSI,
        });

    }

    async findItemsInCatalog(itemNames: string[]) {

        const dbItems = await this.getMockItemsFromFS()

        const itemsMap = {}
        itemNames.forEach((name) => {
            itemsMap[name] = this.findItemInCatalog(name, dbItems)
        })
        return itemsMap;
    }

    async findOneItemInCatalog(name: string) {
        const items = await this.getMockItemsFromFS()
        this.findItemInCatalog(name, items)
        return items;
    }

    findItemInCatalog(name: string, dbItems) {
        // return dbItems.filter((item) => item.name?.toLowerCase().includes(name.toLowerCase()));

        //  finds all items that contain the name as a separate word separated by space or by dash

        return dbItems.filter((item) => item.name?.toLowerCase().split(/[\s-]+/).includes(name.toLowerCase()));
    }

    async findItemsInCatalogByName(itemNames: string[]) {
        const start = Date.now();
        const dbItems = await this.getMockItemsFromFS()
        console.log('itemNames', itemNames);

        const itemsMap = {}
        itemNames.forEach((name) => {
            itemsMap[name] = dbItems.filter((item) => item.name.toLowerCase() === name.toLowerCase());
        })
        const end = Date.now();
        console.log('time find in mockdb', end - start);
        return itemsMap;

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

    async getEmbeddingMap() {

        const fs = require('fs').promises;
        const filePath = './src/grocery-bot-v2/temp-embeddings.json';
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

    async findCosineSimilarity(prompt: string[], resultCount: number = 3) {
        // const embeddingMap = await this.getEmbeddingMap();
        const embeddingMap = await this.getEmbeddingProductsMap();
        const embedding = await this.getOpenAI().embeddings.create({
            model: "text-embedding-ada-002",
            input: prompt,
        });
        const start = Date.now();

        const classifiedAsMap = {}
        prompt.forEach((item, index) => {
            classifiedAsMap[item] = getMostSimilar(embedding.data[index].embedding, embeddingMap, resultCount)
        })

        const end = Date.now();
        console.log('time', end - start);
        return classifiedAsMap;
    }

    async getEmbeddingProductsMap() {
        const fs = require('fs').promises;
        const filePath = './src/grocery-data/mock-embedding-db.json';
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


    async embedding() {
        const mockData = [...getMockData()];
        const embeddingList = mockData.map(item => item.name);
        // const embedding = await this.getOpenAI().embeddings.create({
        //     model: "text-embedding-ada-002",
        //     input: embeddingList,
        // });

        // const embeddedItems = mockData.map((item, index) => {
        //     return {
        //         ...item,
        //         embedding: embedding.data[index].embedding,
        //     }
        // })
        // console.log('embeddedItems', embeddedItems.length);


        // const document = await findSimilarDocuments()
        // const document = await findSimilarDocuments(embedding.data[0].embedding)


        // const embeddingMap = {}
        // embeddingList.forEach((item, index) => {
        //     embeddingMap[item] = embedding.data[index].embedding;
        // })
        // fs.writeFile('./src/grocery-data/mock-db.json', JSON.stringify(embeddedItems), function (err) {
        //     if (err) return console.log(err);
        //     //         console.log('Hello World > helloworld.txt');
        // });

        // return embedding.data;


    }

    async setEmbeddingProductsMap() {
        const fs = require('fs').promises;
        const filePath = './src/grocery-data/mock-db.json';
        try {
            // Read the file asynchronously
            const data = await fs.readFile(filePath, 'utf8');

            // Parse the JSON string to an object
            const products = JSON.parse(data);
            const searchKeywords = products.map((product) => product.name?.toLowerCase()).filter((item) => item);

            console.log('searchKeywords', searchKeywords);



            const embedding = await this.getOpenAI().embeddings.create({
                model: "text-embedding-ada-002",
                input: searchKeywords,
            })

            const embeddingMap = {}
            searchKeywords.forEach((item, index) => {
                embeddingMap[item] = embedding.data[index].embedding;
            })

            fs.writeFile('./src/grocery-data/mock-embedding-db.json', JSON.stringify(embeddingMap), function (err) {
                if (err) return console.log(err);
            });

        } catch (err) {
            console.error('Error reading the file:', err);
            return [];
        }
    }

}


function containsHebrew(text) {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
}


function mergeArrays(cart: ICartItem[], addedItems: ICartItem[]) {
    const mergedArray = [...cart, ...addedItems];
    const nameToItem = new Map();

    mergedArray.forEach((item) => {
        if (!nameToItem.has(item.name)) {
            nameToItem.set(item.name, { ...item });
        } else {
            const existingItem = nameToItem.get(item.name);
            existingItem.quantity = (existingItem.quantity || 0) + (item.quantity || 0);
            nameToItem.set(item.name, existingItem);
        }
    });

    return Array.from(nameToItem.values());
}

function reduceArrays(cart: ICartItem[], removedItems: ICartItem[]) {
    const nameToItem = new Map();

    cart.forEach((item) => {
        nameToItem.set(item.name?.toLowerCase(), { ...item });
    });

    removedItems.forEach((item) => {
        if (nameToItem.has(item.name?.toLowerCase())) {
            const existingItem = nameToItem.get(item.name?.toLowerCase());
            existingItem.quantity = (existingItem.quantity || 0) - ((item.quantity || 0));
            if (existingItem.quantity <= 0) {
                nameToItem.delete(item.name?.toLowerCase());
            } else {
                nameToItem.set(item.name?.toLowerCase(), existingItem);
            }
        }
    });

    return Array.from(nameToItem.values());
}
