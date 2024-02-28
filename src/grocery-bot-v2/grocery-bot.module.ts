import { Module } from '@nestjs/common';
import { GroceryBotController } from './grocery-bot.controller';
import { GroceryBotService } from './grocery-bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './entity/product.entity';

@Module({
  // imports: [MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }])],
  controllers: [GroceryBotController],
  providers: [GroceryBotService],
})
export class GroceryBotModuleV2 {}
