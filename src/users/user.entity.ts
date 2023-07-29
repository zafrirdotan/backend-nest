import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    id: Number,
    name: String,
    email: String,
    // password: String,
    // role: String,
    // createdAt: Date,
    // updatedAt: Date,
    // deletedAt: Date,
});

export interface User {
    id?: number;
    name: string;
    email: string;
    // password: string;
    // role: string;
    // createdAt: Date;
    // updatedAt: Date;
    // deletedAt: Date;
}