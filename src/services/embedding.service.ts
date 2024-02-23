import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { getMockData } from 'src/grocery-bot-v2/mock-data';
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
