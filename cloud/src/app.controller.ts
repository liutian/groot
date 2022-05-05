import { RequestContext } from '@mikro-orm/core';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StudioGroup } from 'entities/StudioGroup';
import { AppService } from './app.service';
@Controller('/studio')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/page/:id')
  getHello(@Param('id') id: number): any {
    return this.appService.getPage(id);
  }

  @Post('/group/add')
  groupAdd(@Body() group: StudioGroup): any {
    return this.appService.groupAdd(group);
  }

  @Get('/group/remove/:groupId')
  groupRemove(@Param('groupId') groupId: number): any {
    this.appService.groupRemove(groupId);
  }
}
