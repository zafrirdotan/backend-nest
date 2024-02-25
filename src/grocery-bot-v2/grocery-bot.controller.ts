import { Body, Controller, Post } from '@nestjs/common';

import { GroceryBotService } from './grocery-bot.service';
import { GrocerySumBody } from './dto/completion-body.dto';

@Controller('api/grocery-bot-v2')
export class GroceryBotController {
  constructor(private readonly groceryBotService: GroceryBotService) {}

  @Post()
  getCompletionWithFunctions(@Body() completionBody: GrocerySumBody) {
    return this.groceryBotService.editCartCompletion(completionBody);
  }
}
