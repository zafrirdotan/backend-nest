import * as fs from 'fs';
import { dairyAndEggsProducts } from 'src/grocery-bot-v2/mock-data/dairy-and-eggs';
import { driedFruitNut } from 'src/grocery-bot-v2/mock-data/dried-fruit-nut';
import { fruits } from 'src/grocery-bot-v2/mock-data/fruits';
import {
  meatProducts,
  frozenMeatProducts,
  chickenProducts,
} from 'src/grocery-bot-v2/mock-data/meat-pruducts';
import { shampooAndConditioners } from 'src/grocery-bot-v2/mock-data/shampoo-and-conditioners';
import { vegetables } from 'src/grocery-bot-v2/mock-data/vegetables';

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
