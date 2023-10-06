import * as mongoose from 'mongoose';
// {
//     "id": 5797055,
//     "name": "Strauss Seasonal Salad 450 g",
//     "brand": "שטראוס",
//     "quantity": "1 unit",
//     "price": "12.5",
//     "productId": 186033,
//     "barcode": "7290106528949",
//     "category": "ירקות חתוכים בשקית"
// },
export const ProductSchema = new mongoose.Schema({
    id: Number,
    name: String,
    brand: String,
    quantity: String,
    price: String,
    productId: Number,
    barcode: String,
    category: String,
});

export interface Product {
    id?: number;
    name: string;
    brand: string;
    quantity: string;
    price: string;
    productId: number;
    barcode: string;
    category: string;
}