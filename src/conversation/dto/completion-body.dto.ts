import { ChatCompletionMessageParam } from "openai/resources/chat";
import { type } from "os";

export interface CompletionBody {
    messages: ChatCompletionMessageParam[];
    tempUserId?: string; // tempUserId is used for streaming three first messages
}

export interface GrocerySumBody {
    messages: ChatCompletionMessageParam[];
    cart: { name: string; quantity: string }[];
    lastAction: Action;
}

export interface Action { action: string; }

export type ActionType = 'add to cart' | 'remove from cart' | 'saying hallo' | 'something else';