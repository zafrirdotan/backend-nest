import * as fs from 'fs';
import { dairyAndEggsProducts } from 'src/grocery-bot-v2/grocery-data/dairy-and-eggs';
import { driedFruitNut } from 'src/grocery-bot-v2/grocery-data/dried-fruit-nut';
import { fruits } from 'src/grocery-bot-v2/grocery-data/fruits';
import {
  meatProducts,
  frozenMeatProducts,
  chickenProducts,
} from 'src/grocery-bot-v2/grocery-data/meat-pruducts';
import { shampooAndConditioners } from 'src/grocery-bot-v2/grocery-data/shampoo-and-conditioners';
import { vegetables } from 'src/grocery-bot-v2/grocery-data/vegetables';

function transformJson(inputJson) {
  const outputJson = {
    id: inputJson.id,
    name: inputJson.names['2']?.long,
    brand: inputJson.brand?.names['1'],
    quantity: `${inputJson.numberOfItems} unit`,
    price: String(inputJson.branch.regularPrice),
    productId: inputJson.productId,
    barcode: inputJson.barcode,
    category: inputJson.family.names['1'].name,
    searchKeywords: inputJson.family?.searchKeywords,
  };
  return outputJson;
}

function formatAllItems(items) {
  return items.map((product) => transformJson(product));
}

export function getMockData() {
  const items = formatAllItems([
    ...vegetables,
    ...fruits,
    ...driedFruitNut,
    ...meatProducts,
    ...frozenMeatProducts.products,
    ...chickenProducts.products,
    ...dairyAndEggsProducts,
    ...shampooAndConditioners,
  ]);

  // console.log('items', items);
  // console.log('items', items.length);

  return items;
}

function setMockData() {
  const mockData = getMockData();

  fs.writeFile(
    './src/grocery-data/mock-db.json',
    JSON.stringify(mockData),
    function (err) {
      if (err) return console.log(err);
    },
  );
}

// setMockData();

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
