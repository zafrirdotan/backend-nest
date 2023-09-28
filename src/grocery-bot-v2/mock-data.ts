// import * as fs from 'fs';
// import { dairyAndEggsProducts } from 'src/grocery-data/dairy-and-eggs';
// import { driedFruitNut } from 'src/grocery-data/dried-fruit-nut';
// import { fruits } from 'src/grocery-data/fruits';
// import { meatProducts, frozenMeatProducts, chickenProducts } from 'src/grocery-data/meat-pruducts';
// import { shampooAndConditioners } from 'src/grocery-data/shampoo-and-conditioners';
// import { vegetables } from 'src/grocery-data/vegetables';



// function transformJson(inputJson) {
//     const outputJson = {
//         id: inputJson.id,
//         name: inputJson.names["2"]?.long,
//         brand: inputJson.brand?.names["1"],
//         quantity: `${inputJson.numberOfItems} unit`,
//         price: String(inputJson.branch.regularPrice),
//         productId: inputJson.productId,
//         barcode: inputJson.barcode,
//         category: inputJson.family.names["1"].name,
//     };
//     return outputJson;
// }

// function formatAllItems(items) {
//     return items.map(product => transformJson(product));
// }

// export function setMockData() {

//     const items = formatAllItems([...vegetables, ...fruits, ...driedFruitNut, ...meatProducts, ...frozenMeatProducts.products, ...chickenProducts.products, ...dairyAndEggsProducts, ...shampooAndConditioners]);

//     console.log('items', items);
//     console.log('items', items.length);



//     fs.writeFile('./src/grocery-data/mock-db.json', JSON.stringify(items), function (err) {
//         if (err) return console.log(err);
//         console.log('Hello World > helloworld.txt');
//     });


// }