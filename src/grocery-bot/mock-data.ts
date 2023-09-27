import { chickenProducts, frozenMeatProducts, meatProducts } from "src/grocery-data/meat-pruducts";
import { mockDataVegetables } from "./mock-balady";
import { dairyAndEggsProducts } from "src/grocery-data/dairy-and-eggs";
import { vegetables } from "src/grocery-data/vegetables";
import { fruits } from "src/grocery-data/fruits";
import { driedFruitNut } from "src/grocery-data/dried-fruit-nut";
import { shampooAndConditioners } from "src/grocery-data/shampoo-and-conditioners";
const fs = require('fs');

export const mockData = ["", "Here", " is", " your", " shopping", " list", " in", " JSON", " format", ":\n\n", "```", "json", "\n", "[\n", " ", " {\"", "name", "\":", " \"", "E", "g", "gs", "\",", " \"", "quantity", "\":", " \"", "1", " dozen", "\"},\n", " ", " {\"", "name", "\":", " \"", "C", "il", "antro", "\",", " \"", "quantity", "\":", " \"", "2", " bunch", "es", "\"},\n", " ", " {\"", "name", "\":", " \"", "Qu", "inoa", "\",", " \"", "quantity", "\":", " \"", "1", " lb", ".\"},\n", " ", " {\"", "name", "\":", " \"", "Ground", " turkey", "\",", " \"", "quantity", "\":", " \"", "2", " lbs", ".\"},\n", " ", " {\"", "name", "\":", " \"", "Al", "mond", " milk", "\",", " \"", "quantity", "\":", " \"", "1", " quart", "\"},\n", " ", " {\"", "name", "\":", " \"", "Str", "aw", "berries", "\",", " \"", "quantity", "\":", " \"", "2", " pun", "nets", "\"}\n", "]\n", "``", "`\n\n", "Let", " me", " know", " if", " there", "'s", " anything", " else", " I", " can", " assist", " you", " with", ".", ""]



export const mockItems = [
    { "id": 1, "name": "Granny Smith apples", "quantity": "1 lb", "price": "2.99" },
    { "id": 2, "name": "Bananas", "quantity": "1 lb", "price": "0.79" },
    { "id": 3, "name": "Baby carrots", "quantity": "16 oz bag", "price": "1.49" },
    { "id": 4, "name": "Broccoli crowns", "quantity": "1 lb", "price": "1.89" },
    { "id": 5, "name": "Fresh Atlantic salmon", "quantity": "1 lb", "price": "8.99" },
    { "id": 6, "name": "Boneless, skinless chicken breast", "quantity": "1 lb", "price": "5.49" },
    { "id": 7, "name": "Lean ground beef", "quantity": "1 lb", "price": "4.99" },
    { "id": 8, "name": "Whole wheat bread", "quantity": "1 loaf", "price": "2.99" },
    { "id": 9, "name": "Almond milk", "quantity": "64 oz carton", "price": "2.89" },
    { "id": 10, "name": "Greek yogurt", "quantity": "32 oz container", "price": "5.99" },
    { "id": 11, "name": "Extra-large eggs", "quantity": "dozen", "price": "2.79" },
    { "id": 12, "name": "Sharp cheddar cheese", "quantity": "8 oz block", "price": "3.49" },
    { "id": 13, "name": "Classic hummus", "quantity": "10 oz container", "price": "2.99" },
    { "id": 14, "name": "Unsweetened almond butter", "quantity": "16 oz jar", "price": "6.99" },
    { "id": 15, "name": "Olive oil", "quantity": "25.3 oz bottle", "price": "7.99" },
    { "id": 16, "name": "Brown rice", "quantity": "32 oz bag", "price": "2.99" },
    { "id": 17, "name": "Whole wheat spaghetti", "quantity": "16 oz box", "price": "1.59" },
    { "id": 18, "name": "Black beans", "quantity": "15 oz can", "price": "0.99" },
    { "id": 19, "name": "Diced tomatoes", "quantity": "14.5 oz can", "price": "1.19" },
    { "id": 20, "name": "Organic baby spinach", "quantity": "5 oz container", "price": "3.49" },
    { "id": 21, "name": "Frozen mixed berries", "quantity": "16 oz bag", "price": "3.99" },
    { "id": 22, "name": "Frozen broccoli florets", "quantity": "16 oz bag", "price": "1.99" },
    { "id": 23, "name": "Ice cream, vanilla", "quantity": "1.5 qt", "price": "4.99" },
    { "id": 24, "name": "Chocolate chip cookies", "quantity": "16 oz pack", "price": "3.49" },
    { "id": 25, "name": "All-purpose flour", "quantity": "5 lb bag", "price": "2.49" },
    { "id": 26, "name": "Granulated sugar", "quantity": "4 lb bag", "price": "2.39" },
    { "id": 27, "name": "Baking powder", "quantity": "8.1 oz can", "price": "1.99" },
    { "id": 28, "name": "Sea salt", "quantity": "26 oz container", "price": "1.99" },
    { "id": 29, "name": "Black peppercorns", "quantity": "3.5 oz container", "price": "3.49" },
    { "id": 30, "name": "Cinnamon sticks", "quantity": "1.5 oz jar", "price": "2.99" },
    { "id": 31, "name": "Dry roasted almonds", "quantity": "16 oz bag", "price": "6.99" },
    { "id": 32, "name": "Fresh thyme", "quantity": "0.75 oz pack", "price": "1.99" },
    { "id": 33, "name": "Yellow onions", "quantity": "3 lb bag", "price": "2.99" },
    { "id": 34, "name": "Garlic bulbs", "quantity": "3 count", "price": "1.49" },
    { "id": 35, "name": "Sweet potatoes", "quantity": "3 lb bag", "price": "3.99" },
    { "id": 36, "name": "Zucchini", "quantity": "1 lb", "price": "1.49" },
    { "id": 37, "name": "Honey", "quantity": "12 oz bottle", "price": "4.99" },
    { "id": 38, "name": "Peanut butter", "quantity": "18 oz jar", "price": "2.49" },
    { "id": 39, "name": "Orange juice", "quantity": "64 oz bottle", "price": "3.49" },
    { "id": 40, "name": "Apple cider vinegar", "quantity": "16 oz bottle", "price": "2.89" },
    { "id": 41, "name": "Green tea bags", "quantity": "20 count", "price": "3.99" },
    { "id": 42, "name": "Coffee beans, medium roast", "quantity": "12 oz bag", "price": "6.99" },
    { "id": 43, "name": "Dish soap", "quantity": "25 oz bottle", "price": "2.99" },
    { "id": 44, "name": "Laundry detergent", "quantity": "100 oz bottle", "price": "9.99" },
    { "id": 45, "name": "Aluminum foil", "quantity": "75 sq ft roll", "price": "3.49" },
    { "id": 46, "name": "Plastic wrap", "quantity": "200 sq ft roll", "price": "2.49" },
    { "id": 47, "name": "Paper towels", "quantity": "6 rolls", "price": "5.99" },
    { "id": 48, "name": "Toilet paper", "quantity": "12 rolls", "price": "9.99" },
    { "id": 49, "name": "Toothpaste", "quantity": "4.7 oz tube", "price": "2.99" },
    { "id": 50, "name": "Shampoo", "quantity": "16 oz bottle", "price": "5.99" },
    { "id": 51, "name": "cottage cheese", "brand": "Tnuva", "quantity": "300 gr", "price": "5.99" },
    { "id": 51, "name": "cottage cheese", "brand": "Shtrause", "quantity": "300 gr", "price": "5.99" },
    {
        id: 5416811,
        name: 'Parsley Root Unit',
        brand: 'Marina',
        quantity: '1 unit',
        price: '5.9',
        productId: 2434295,
        barcode: '7290017696812'
    },
    {
        id: 346709,
        name: 'Artichoke',
        brand: undefined,
        quantity: '1 unit',
        price: '19.9',
        productId: 245596,
        barcode: '1014'
    },
    {
        id: 7610580,
        name: 'Packaged Cauliflower',
        brand: undefined,
        quantity: '1 unit',
        price: '9.9',
        productId: 3102347,
        barcode: 'SP.CAULIFLOWER'
    },
    {
        id: 2373477,
        name: 'Packaged Mehadrin Dill',
        brand: 'A.Adama',
        quantity: '1 unit',
        price: '4.9',
        productId: 418646,
        barcode: '7290010051175'
    },
    {
        id: 2435962,
        name: 'Beet Leaves',
        brand: undefined,
        quantity: '1 unit',
        price: '7.9',
        productId: 51843,
        barcode: '7290003706082'
    },
    {
        id: 3863488,
        name: 'Duet Mushrooms',
        brand: 'Chavat HaShampion',
        quantity: '1 unit',
        price: '17.9',
        productId: 895268,
        barcode: '7290000961521'
    },
    {
        id: 13947364,
        name: 'Beet',
        brand: undefined,
        quantity: '1 unit',
        price: '10.9',
        productId: 4686569,
        barcode: 'SP.BEET1'
    },
    {
        id: 6874740,
        name: 'Red Romano Pepper (Shoshka)',
        brand: 'Marina',
        quantity: '1 unit',
        price: '19',
        productId: 2975822,
        barcode: '157'
    }
]


console.log('mockItems', mockItems.length);


function transformJson(inputJson) {
    const outputJson = {
        id: inputJson.id,
        name: inputJson.names["2"]?.long,
        brand: inputJson.brand?.names["1"],
        quantity: `${inputJson.numberOfItems} unit`,
        price: String(inputJson.branch.regularPrice),
        productId: inputJson.productId,
        barcode: inputJson.barcode,
        category: inputJson.family.names["1"].name,
    };
    return outputJson;
}

function formatAllItems(items) {
    return items.map(product => transformJson(product));
}

export function setMockData() {

    const items = formatAllItems([...vegetables, ...fruits, ...driedFruitNut, ...meatProducts, ...frozenMeatProducts.products, ...chickenProducts.products, ...dairyAndEggsProducts, ...shampooAndConditioners]);

    console.log('items', items);
    console.log('items', items.length);



    fs.writeFile('./src/grocery-data/mock-db.json', JSON.stringify(items), function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
    });


}