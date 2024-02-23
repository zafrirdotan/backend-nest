import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { getMockData } from 'src/grocery-bot-v2/mock-data/mock-data';
import { getMostSimilar } from 'src/utils/cosine-similarity';

@Injectable()
export class EmbeddingService {
  constructor() {}

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
    const embeddingMap = await this.getEmbeddingProductsMap();
    const embedding = await this.getOpenAI().embeddings.create({
      model: 'text-embedding-ada-002',
      input: prompt,
    });
    const start = Date.now();

    const classifiedAsMap = {};
    prompt.forEach((item, index) => {
      classifiedAsMap[item] = getMostSimilar(
        embedding.data[index].embedding,
        embeddingMap,
        resultCount,
      );
    });

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
    const embeddingList = mockData.map((item) => item.name);
    const embedding = await this.getOpenAI().embeddings.create({
      model: 'text-embedding-ada-002',
      input: embeddingList,
    });

    const embeddedItems = mockData.map((item, index) => {
      return {
        ...item,
        embedding: embedding.data[index].embedding,
      };
    });
    console.log('embeddedItems', embeddedItems.length);

    const embeddingMap = {};
    embeddingList.forEach((item, index) => {
      embeddingMap[item] = embedding.data[index].embedding;
    });

    const fs = require('fs').promises;

    fs.writeFile(
      './src/grocery-data/mock-db.json',
      JSON.stringify(embeddedItems),
      function (err) {
        if (err) return console.log(err);
        //         console.log('Hello World > helloworld.txt');
      },
    );

    return embedding.data;
  }

  async setEmbeddingProductsMap() {
    const fs = require('fs').promises;
    const filePath = './src/grocery-data/mock-db.json';
    try {
      // Read the file asynchronously
      const data = await fs.readFile(filePath, 'utf8');

      // Parse the JSON string to an object
      const products = JSON.parse(data);
      const searchKeywords = products
        .map((product) => product.name?.toLowerCase())
        .filter((item) => item);

      console.log('searchKeywords', searchKeywords);

      const embedding = await this.getOpenAI().embeddings.create({
        model: 'text-embedding-ada-002',
        input: searchKeywords,
      });

      const embeddingMap = {};
      searchKeywords.forEach((item, index) => {
        embeddingMap[item] = embedding.data[index].embedding;
      });

      fs.writeFile(
        './src/grocery-data/mock-embedding-db.json',
        JSON.stringify(embeddingMap),
        function (err) {
          if (err) return console.log(err);
        },
      );
    } catch (err) {
      console.error('Error reading the file:', err);
      return [];
    }
  }

  getOpenAI(): OpenAI {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}

export const TextToEmbed = [
  'hallo',
  'how are you',
  'add to cart',
  'remove from cart',
  'show me the cart',
  'clear the cart',
  'add x more',
  'remove x more',
  'grocery list',
  // "yes",
  // "no",
  'is the product available',
  'greetings',
  "what's up",
  'please add this to my cart',
  "I'd like to delete this from my cart",
  "can you show me what's in my cart",
  'empty my cart',
  'put more of this in my cart',
  'do you have [product name] in stock',
  'agree',
  'decline',
  'is this in stock',
  'can I purchase this item',
  'check out',
  'proceed to payment',
  'is there a discount on this item',
  'search for [product name]',
  'show me similar items',
  'can I return this item',
  'what is the return policy',
  'track my order',
  'update my shipping information',
  'is this item on sale',
  'apply coupon code',
  'is there a warranty on this item',
  'how much does this cost',
  'what are the payment options',
  'cancel my order',
  'help me',
  'what are the shipping options',
  'update my billing information',
];
