import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { ComponentService } from 'service/component.service';
import { ApplicationService } from 'service/application.service';
import { PropBlockService } from 'service/prop-block.service';
import { PropGroupService } from 'service/prop-group.service';
import { PropItemService } from 'service/prop-item.service';
import { ScaffoldService } from 'service/scaffold.service';
import { PropValueService } from 'service/prop-value.service';
import { PropValue } from 'entities/PropValue';
@Controller('/workbench')
export class WorkbenchController {
  constructor(
    private readonly propItemService: PropItemService,
    private readonly blockService: PropBlockService,
    private readonly groupService: PropGroupService,
    private readonly componentService: ComponentService,
    private readonly applicationService: ApplicationService,
    private readonly scaffoldService: ScaffoldService,
    private readonly propValueService: PropValueService
  ) { }

  @Get('/component/instance/detail/:componentId')
  async getComponent(@Param('componentId') componentId: number, @Query('releaseId') releaseId?: number) {
    return this.componentService.getComponentInstance(componentId, releaseId);
  }

  @Get('/component/prototype/detail/:componentId')
  async getComponentForEdit(@Param('componentId') componentId: number, @Query('versionId') versionId?: number) {
    return this.componentService.getComponentPrototype(componentId, versionId);
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
      return await this.propItemService.movePosition(data.originId, data.targetId);
    }
  }

  @Post('/block/add')
  async blockAdd(@Body() block: PropBlock) {
    return this.blockService.add(block);
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
    return this.propItemService.add(item);
  }

  @Get('/item/remove/:itemId')
  async itemRemove(@Param('itemId') itemId: number) {
    return await this.propItemService.remove(itemId);
  }

  @Post('/item/update')
  async itemUpdate(@Body() item: PropItem) {
    return await this.propItemService.update(item);
  }

  @Get('/application/detail/:applicationId')
  async applicationDetail(@Param('applicationId') applicationId: number, @Query('releaseId') releaseId: number) {
    return this.applicationService.getDetail(applicationId, releaseId);
  }

  @Get('/scaffold/detail/:scaffoldId')
  async scaffoldDetail(@Param('scaffoldId') scaffoldId: number) {
    return this.scaffoldService.getDetail(scaffoldId);
  }

  @Post('/block/list-struct-perfs/save')
  async listStructPerfsSave(@Body('blockId') blockId: number, @Body('data') data: string) {
    await this.blockService.listStructPerfsSave(blockId, data);
  }

  @Post('/value/list-for-prototype/add')
  async valueListForPrototypeAdd(@Body() propValue: PropValue) {
    await this.propValueService.valueListForPrototypeAdd(propValue);
  }

  @Get('/value/list-for-prototype/remove/:propValueId')
  async valueListForPrototypeRemove(@Param('propValueId') propValueId: number) {
    await this.propValueService.valueListForPrototypeRemove(propValueId);
  }

  @Post('/value/list-for-prototype/update-order')
  async valueListForPrototypeUpdateOrder(@Body('propValueId') propValueId: number, @Body('value') value: string) {
    await this.propValueService.valueListForPrototypeUpdateOrder(propValueId, value);
  }
}
