import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem } from 'entities/StudioItem';
import { StudioBlockService } from 'service/StudioBlock.service';
import { StudioGroupService } from 'service/StudioGroup.service';
import { StudioItemService } from 'service/StudioItem.service';
import { AppService } from './app.service';
@Controller('/studio')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly itemService: StudioItemService,
    private readonly blockService: StudioBlockService,
    private readonly groupService: StudioGroupService
  ) { }

  @Get('/component')
  async getHello(@Query('id') id: number, @Query('versionId') versionId: number) {
    return this.appService.getComponent(id, versionId);
  }

  @Post('/group/add')
  async groupAdd(@Body() group: StudioGroup) {
    return this.groupService.add(group);
  }

  @Get('/group/remove/:groupId')
  async groupRemove(@Param('groupId') groupId: number) {
    await this.groupService.remove(groupId);
  }

  @Post('/group/update')
  async groupUpdate(@Body() group: StudioGroup) {
    await this.groupService.update(group);
  }

  @Post('/move/position')
  async movePosition(@Body() data: { originId: number, targetId: number, type: 'group' | 'block' | 'item' }) {
    // 将 origin 移动至 target位置，target 向后一一位
    if (data.type === 'group') {
      await this.groupService.movePosition(data.originId, data.targetId);
    } else if (data.type === 'block') {
      await this.blockService.movePosition(data.originId, data.targetId);
    } else if (data.type === 'item') {
      await this.itemService.movePosition(data.originId, data.targetId);
    }
  }

  @Post('/block/add')
  async blockAdd(@Body() block: StudioBlock) {
    return this.blockService.add(block);
  }

  @Post('/block/addFromTemplate')
  async addFromTemplate(@Body('groupId') groupId: number) {
    return this.blockService.addFromTemplate(groupId);
  }

  @Get('/block/remove/:blockId')
  async blockRemove(@Param('blockId') blockId: number) {
    await this.blockService.remove(blockId);
  }

  @Post('/block/update')
  async blockUpdate(@Body() block: StudioBlock) {
    await this.blockService.update(block);
  }

  @Post('/item/add')
  async itemAdd(@Body() item: StudioItem) {
    return this.itemService.add(item);
  }

  @Get('/item/remove/:itemId')
  async itemRemove(@Param('itemId') itemId: number) {
    await this.itemService.remove(itemId);
  }

  @Post('/item/update')
  async itemUpdate(@Body() item: StudioItem) {
    await this.itemService.update(item);
  }
}
