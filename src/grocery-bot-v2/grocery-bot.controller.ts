import { Body, Controller, Post } from '@nestjs/common';

import { GroceryBotService } from './grocery-bot.service';
import { GrocerySumBody } from './dto/completion-body.dto';

@Controller('api/grocery-bot-v2')
export class GroceryBotController {
    constructor(private readonly groceryBotService: GroceryBotService) { }

    @Post()
    getCompletionWithFunctions(@Body() completionBody: GrocerySumBody) {
        const massage = completionBody.messages[completionBody.messages.length - 1].content;
        if (containsHebrew(massage)) {
            console.log('hebrew');
            return this.groceryBotService.editCartCompletionHebrew(completionBody.messages, completionBody.cart, completionBody.lastAction);
        }
        console.log('English');

        // return this.conversationService.checkMessageType(completionBody.messages);
        return this.groceryBotService.editCartCompletion(completionBody.messages, completionBody.cart, completionBody.lastAction);
    }

}

function containsHebrew(text) {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
}
