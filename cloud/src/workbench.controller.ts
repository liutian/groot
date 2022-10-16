import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { ComponentService } from 'service/component.service';
import { ApplicationService } from 'service/application.service';
import { PropBlockService } from 'service/prop-block.service';
import { PropGroupService } from 'service/prop-group.service';
import { PropItemService } from 'service/prop-item.service';
import { OrgService } from 'service/org.service';
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
    private readonly orgService: OrgService,
    private readonly propValueService: PropValueService,
    private readonly componentVersionService: ComponentVersionService,
    private readonly componentInstanceService: ComponentInstanceService,
    private readonly releaseService: ReleaseService,
    private readonly assetService: AssetService
  ) { }

  @Post('/component/add')
  async componentAdd(@Body() component: Component) {
    return await this.componentService.add(component);
  }

  @Post('/group/add')
  async groupAdd(@Body() group: PropGroup) {
    return this.groupService.add(group);
  }

  @Post('/group/update')
  async groupUpdate(@Body() group: PropGroup) {
    await this.groupService.update(group);
  }

  @Get('/group/remove/:groupId')
  async groupRemove(@Param('groupId') groupId: number) {
    await this.groupService.remove(groupId);
  }

  @Post('/block/add')
  async blockAdd(@Body() block: PropBlock) {
    return this.blockService.add(block);
  }

  @Post('/block/update')
  async blockUpdate(@Body() block: PropBlock) {
    await this.blockService.update(block);
  }

  @Get('/block/remove/:blockId')
  async blockRemove(@Param('blockId') blockId: number) {
    await this.blockService.remove(blockId);
  }

  @Post('/item/add')
  async itemAdd(@Body() item: PropItem) {
    return this.propItemService.add(item);
  }

  @Post('/item/update')
  async itemUpdate(@Body() item: PropItem) {
    return await this.propItemService.update(item);
  }

  @Get('/item/remove/:itemId')
  async itemRemove(@Param('itemId') itemId: number) {
    return await this.propItemService.remove(itemId);
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

  @Post('/block/list-struct-primary-item/save')
  async blockListStructPrimaryItemSave(@Body('blockId') blockId: number, @Body('data') data: string) {
    await this.blockService.listStructPrimaryItemSave(blockId, data);
  }

  @Post('/value/abstract-type/add')
  async valueAbstractTypeAdd(@Body() rawPropValue: PropValue) {
    return await this.propValueService.abstractTypeAdd(rawPropValue);
  }

  @Get('/value/abstract-type/remove/:propValueId')
  async valueAbstractTypeRemove(@Param('propValueId') propValueId: number) {
    return await this.propValueService.abstractTypeRemove(propValueId);
  }

  @Post('/value/update')
  async valueUpdate(@Body() rawPropValue: PropValue) {
    return await this.propValueService.update(rawPropValue);
  }

  @Post('/component-instance/add')
  async componentInstanceAdd(@Body() componentInstance: ComponentInstance) {
    return await this.componentInstanceService.add(componentInstance);
  }

  @Get('/component/list')
  async componentList() {
    return await this.componentService.list();
  }

  @Get('/org/detail/:orgId')
  async orgDetail(@Param('orgId') orgId: number) {
    return this.orgService.getDetail(orgId);
  }

  @Get('/component-prototype/detail/:componentId')
  async componentPrototypeDetail(@Param('componentId') componentId: number, @Query('versionId') versionId: number) {
    return this.componentService.getComponentPrototype(componentId, versionId);
  }

  @Get('/application/detail/:applicationId')
  async applicationDetail(@Param('applicationId') applicationId: number, @Query('releaseId') releaseId: number) {
    return this.applicationService.getDetail(applicationId, releaseId);
  }

  @Get('/component-instance/root-detail/:instanceId')
  async rootComponentInstanceDetail(@Param('instanceId') instanceId: number) {
    return this.componentInstanceService.getRootDetail(instanceId);
  }

  @Post('/component-version/add')
  async componentVersionAdd(@Body() componentVersion: ComponentVersion) {
    return await this.componentVersionService.add(componentVersion);
  }

  // 基于特定迭代创建新迭代
  @Post('/release/add')
  async releaseAdd(@Body() release: Release) {
    return await this.releaseService.add(release);
  }

  @Get('/release/detail/:releaseId')
  async releaseDetail(@Param('releaseId') releaseId: number) {
    return await this.releaseService.detail(releaseId);
  }

  @Get('/component-instance/detail-id')
  async componentInstanceDetailIdByTrackId(@Query('releaseId') releaseId: number, @Query('trackId') trackId: number) {
    return await this.componentInstanceService.detailIdByTrackId(trackId, releaseId);
  }

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

  @Get('/component-instance/remove/:instanceId')
  async componentInstanceRemove(@Param('instanceId') instanceId: number) {
    return await this.componentInstanceService.remove(instanceId);
  }

  @Get('/demo')
  async demo() {
    return [
      { id: 1, name: '张三', age: 22, address: '上海长宁' },
      { id: 2, name: '李四', age: 45, address: '北京海淀' },
      { id: 3, name: '王五', age: 18, address: '河南开封' },
      { id: 4, name: '小六', age: 30, address: '美国纽约' },
    ]
  }
}
