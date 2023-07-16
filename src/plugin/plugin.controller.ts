import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { coffeeList } from './data/coffees';
import { PluginService } from './plugin.service';
import * as oas from './oas.json';
import * as manifest from './ai-plugin.json';

@Controller('plugin')
export class PluginController {

    constructor(private pluginService: PluginService) { }

    @Get('coffee-list')
    getCoffee() {

        return coffeeList;
    }

    @Get('coffee-list/:id')
    getCoffeeById(@Query('id') id: number) {
        return coffeeList.find(coffee => coffee.id === 1);
    }

    @Get('coffee-list/:name')
    getCoffeeByName(@Query('name') name: string) {
        return coffeeList.find(coffee => coffee.name === name);
    }

    @Get('coffee-list/:price')
    getCoffeeByPrice(@Query('price') price: number) {
        return coffeeList.find(coffee => coffee.price === price);
    }

    @Get('oas-file')
    async getOas(): Promise<void> {
        return oas as any;
    }

    @Get('/well-known/ai-plugin.json')
    async getPlugin() {
        return manifest
    }

}
