import { RequestContext } from '@mikro-orm/core';
import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('/studio')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/page/:id')
  getHello(@Param('id') id: number): any {
    return this.appService.getPage(id);
  }
}
