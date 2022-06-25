import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { ComponentService } from 'service/Component.service';
import { PropBlockService } from 'service/PropBlock.service';
import { PropGroupService } from 'service/PropGroup.service';
import { PropItemService } from 'service/PropItem.service';
@Controller('/studio')
export class StudioController {
  constructor(
    private readonly itemService: PropItemService,
    private readonly blockService: PropBlockService,
    private readonly groupService: PropGroupService,
    private readonly componentService: ComponentService,
  ) { }

  @Get('/component')
  async getComponent(@Query('id') id: number, @Query('releaseId') releaseId?: number) {
    return this.componentService.getComponentForRelease(id, releaseId);
  }

  @Get('/component/edit')
  async getComponentForEdit(@Query('id') id: number, @Query('versionId') versionId?: number) {
    return this.componentService.getComponentForVersion(id, versionId);
  }

  @Post('/group/add')
  async groupAdd(@Body() group: PropGroup) {
    return this.groupService.add(group);
  }

  @Get('/group/remove/:groupId')
  async groupRemove(@Param('groupId') groupId: number) {
    await this.groupService.remove(groupId);
  }

  @Post('/group/update')
  async groupUpdate(@Body() group: PropGroup) {
    await this.groupService.update(group);
  }

  @Post('/move/position')
  async movePosition(@Body() data: { originId: number, targetId: number, type: 'group' | 'block' | 'item' }) {
    // 将 origin 移动至 target位置，target 向后一一位
    if (data.type === 'group') {
      return await this.groupService.movePosition(data.originId, data.targetId);
    } else if (data.type === 'block') {
      return await this.blockService.movePosition(data.originId, data.targetId);
    } else if (data.type === 'item') {
      return await this.itemService.movePosition(data.originId, data.targetId);
    }
  }

  @Post('/block/add')
  async blockAdd(@Body() block: PropBlock) {
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
  async blockUpdate(@Body() block: PropBlock) {
    await this.blockService.update(block);
  }

  @Post('/item/add')
  async itemAdd(@Body() item: PropItem) {
    return this.itemService.add(item);
  }

  @Get('/item/remove/:itemId')
  async itemRemove(@Param('itemId') itemId: number) {
    return await this.itemService.remove(itemId);
  }

  @Post('/item/update')
  async itemUpdate(@Body() item: PropItem) {
    return await this.itemService.update(item);
  }
}
