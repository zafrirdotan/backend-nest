import { ChatCompletionRequestMessage } from "openai";

export interface CompletionBody {
    messages: ChatCompletionRequestMessage[];
    tempUserId?: string; // tempUserId is used for streaming three first messages
}