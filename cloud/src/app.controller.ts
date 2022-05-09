import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get('/page/:id')
  getHello(@Param('id') id: number): any {
    return this.appService.getPage(id);
  }

  @Post('/group/add')
  groupAdd(@Body() group: StudioGroup): any {
    return this.groupService.add(group);
  }

  @Get('/group/remove/:groupId')
  groupRemove(@Param('groupId') groupId: number): any {
    this.groupService.remove(groupId);
  }

  @Post('/group/update')
  groupUpdate(@Body() group: StudioGroup): any {
    this.groupService.update(group);
  }

  @Post('/move/position')
  movePosition(@Body() data: { originId: number, targetId: number, type: 'group' | 'block' | 'item' }): any {
    // 将 origin 移动至 target位置，target 向后一一位
    if (data.type === 'group') {
      this.groupService.movePosition(data.originId, data.targetId);
    } else if (data.type === 'block') {
      this.blockService.movePosition(data.originId, data.targetId);
    } else if (data.type === 'item') {
      this.itemService.movePosition(data.originId, data.targetId);
    }
  }

  @Post('/block/add')
  blockAdd(@Body() block: StudioBlock, @Body('moveBlockId') moveBlockId: number): any {
    return this.blockService.add(block, moveBlockId);
  }

  @Get('/block/remove/:blockId')
  blockRemove(@Param('blockId') blockId: number): any {
    this.blockService.remove(blockId);
  }

  @Post('/block/update')
  blockUpdate(@Body() block: StudioBlock): any {
    this.blockService.update(block);
  }

  @Post('/item/add')
  itemAdd(@Body() item: StudioItem, @Body('moveItemId') moveItemId: number): any {
    return this.itemService.add(item, moveItemId);
  }

  @Get('/item/remove/:itemId')
  itemRemove(@Param('itemId') itemId: number): any {
    this.itemService.remove(itemId);
  }

  @Post('/item/update')
  itemUpdate(@Body() item: StudioItem): any {
    this.itemService.update(item);
  }
}
