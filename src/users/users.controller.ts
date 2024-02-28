import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // @Post('create')
  // async create(@Body() body: User): Promise<User> {
  //     console.log('create user');
  //     const user = await this.userService.create(body);
  //     return user;
  // }

  // @Get('email/:email')
  // find(@Param('email') email: string): any {
  //     console.log('find user');
  //     return this.userService.findOneByEmail(email);
  // }

  // @Get('findAll')
  // findAll(): any {
  //     console.log('find all users');
  //     // return this.userService.findAll();
  // }
}
