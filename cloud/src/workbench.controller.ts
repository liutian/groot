import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
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
import { Component } from 'entities/Component';
import { ComponentVersionService } from 'service/component-version.service';
import { ComponentVersion } from 'entities/ComponentVersion';
import { ComponentInstanceService } from 'service/component-instance.service';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ReleaseService } from 'service/release.service';
import { Release } from 'entities/Release';
import { StandardResultInterceptor } from 'config/standard-result.interceptor';
import { AssetService } from 'service/asset.service';
import { EnvType } from '@grootio/common';

@UseInterceptors(StandardResultInterceptor)
@Controller('/workbench')
export class WorkbenchController {
  constructor(
    private readonly propItemService: PropItemService,
    private readonly blockService: PropBlockService,
    private readonly groupService: PropGroupService,
    private readonly componentService: ComponentService,
    private readonly applicationService: ApplicationService,
    private readonly scaffoldService: ScaffoldService,
    private readonly propValueService: PropValueService,
    private readonly componentVersionService: ComponentVersionService,
    private readonly componentInstanceService: ComponentInstanceService,
    private readonly releaseService: ReleaseService,
    private readonly assetService: AssetService
  ) { }

  // checked
  @Post('/component/add')
  async componentAdd(@Body() component: Component) {
    return await this.componentService.add(component);
  }

  // checked
  @Post('/group/add')
  async groupAdd(@Body() group: PropGroup) {
    return this.groupService.add(group);
  }

  // checked
  @Post('/group/update')
  async groupUpdate(@Body() group: PropGroup) {
    await this.groupService.update(group);
  }

  // checked
  @Get('/group/remove/:groupId')
  async groupRemove(@Param('groupId') groupId: number) {
    await this.groupService.remove(groupId);
  }

  // checked
  @Post('/block/add')
  async blockAdd(@Body() block: PropBlock) {
    return this.blockService.add(block);
  }

  // checked
  @Post('/block/update')
  async blockUpdate(@Body() block: PropBlock) {
    await this.blockService.update(block);
  }

  // checked
  @Get('/block/remove/:blockId')
  async blockRemove(@Param('blockId') blockId: number) {
    await this.blockService.remove(blockId);
  }

  // checked
  @Post('/item/add')
  async itemAdd(@Body() item: PropItem) {
    return this.propItemService.add(item);
  }

  // checked
  @Post('/item/update')
  async itemUpdate(@Body() item: PropItem) {
    return await this.propItemService.update(item);
  }

  // checked
  @Get('/item/remove/:itemId')
  async itemRemove(@Param('itemId') itemId: number) {
    return await this.propItemService.remove(itemId);
  }

  // checked
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

  // checked
  @Post('/block/list-struct-primary-item/save')
  async blockListStructPrimaryItemSave(@Body('blockId') blockId: number, @Body('data') data: string) {
    await this.blockService.listStructPrimaryItemSave(blockId, data);
  }

  // checked
  @Post('/value/abstract-type/add')
  async valueAbstractTypeAdd(@Body() rawPropValue: PropValue) {
    return await this.propValueService.abstractTypeAdd(rawPropValue);
  }

  // checked
  @Get('/value/abstract-type/remove/:propValueId')
  async valueAbstractTypeRemove(@Param('propValueId') propValueId: number) {
    return await this.propValueService.abstractTypeRemove(propValueId);
  }

  // checked
  @Post('/value/update')
  async valueUpdate(@Body() rawPropValue: PropValue) {
    return await this.propValueService.update(rawPropValue);
  }

  // checked
  @Post('/component-instance/add')
  async componentInstanceAdd(@Body() componentInstance: ComponentInstance) {
    return await this.componentInstanceService.add(componentInstance);
  }

  // checked
  @Get('/component/list')
  async componentList(@Query('container') container: string) {
    return await this.componentService.list(container);
  }

  // checked
  @Get('/scaffold/detail/:scaffoldId')
  async scaffoldDetail(@Param('scaffoldId') scaffoldId: number) {
    return this.scaffoldService.getDetail(scaffoldId);
  }

  // checked
  @Get('/component-prototype/detail/:componentId')
  async componentPrototypeDetail(@Param('componentId') componentId: number, @Query('versionId') versionId: number) {
    return this.componentService.getComponentPrototype(componentId, versionId);
  }

  // checked
  @Get('/application/detail/:applicationId')
  async applicationDetail(@Param('applicationId') applicationId: number, @Query('releaseId') releaseId: number) {
    return this.applicationService.getDetail(applicationId, releaseId);
  }

  // checked
  @Get('/component-instance/page-detail/:instanceId')
  async componentInstanceDetail(@Param('instanceId') instanceId: number) {
    return this.componentInstanceService.getPageDetail(instanceId);
  }

  // checked
  @Post('/component-version/add')
  async componentVersionAdd(@Body() componentVersion: ComponentVersion) {
    return await this.componentVersionService.add(componentVersion);
  }

  // checked
  // 基于特定迭代创建新迭代
  @Post('/release/add')
  async releaseAdd(@Body() release: Release) {
    return await this.releaseService.add(release);
  }

  // checked
  @Get('/release/detail/:releaseId')
  async releaseDetail(@Param('releaseId') releaseId: number) {
    return await this.releaseService.detail(releaseId);
  }

  // checked
  @Get('/component-instance/detail-id')
  async componentInstanceDetailIdByTrackId(@Query('releaseId') releaseId: number, @Query('trackId') trackId: number) {
    return await this.componentInstanceService.detailIdByTrackId(trackId, releaseId);
  }

  // checked
  @Post('/component-version/publish')
  async componentVersionPublish(@Body('componentId') componentId: number, @Body('versioinId') versionId: number) {
    await this.componentVersionService.publish(componentId, versionId);
  }


  @Post('/asset/build')
  async assetBuild(@Body('releaseId') releaseId: number) {
    return this.assetService.build(releaseId);
  }


  @Post('/asset/deploy')
  async assetDeploy(@Body('bundleId') bundleId: number, @Body('env') env: EnvType) {
    return this.assetService.deploy(bundleId, env);
  }

  @Post('/component-instance/add-child')
  async componentInstanceAddChild(@Body() rawInstance: ComponentInstance) {
    return await this.componentInstanceService.addChild(rawInstance);
  }
}
