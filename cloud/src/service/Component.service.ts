import { PropValueType } from '@grootio/common';
import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Scaffold } from 'entities/Scaffold';
import { pick } from 'util/common';


@Injectable()
export class ComponentService {

  /**
   * 获取组件某个版本的配置信息
   * @param id 组件ID
   * @param versionId 组件版本
   * @returns 组件信息
   */
  async getComponentPrototype(id: number, versionId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id, { populate: ['versionList'] });

    if (!component) {
      throw new LogicException(`not found component id: ${id}`, LogicExceptionCode.NotFound);
    }

    if (!versionId && !component.recentVersion?.id) {
      throw new LogicException('not found component version id', LogicExceptionCode.NotFound);
    }

    const version = await em.findOne(ComponentVersion, versionId || component.recentVersion?.id,
      { populate: ['groupList', 'blockList', 'itemList', 'valueList'], populateWhere: { valueList: { type: { $ne: PropValueType.Default } } } }
    );

    if (!version) {
      throw new LogicException('not found component version ', LogicExceptionCode.NotFound);
    }

    component.version = wrap(version).toObject() as any;

    return component;
  }

  async add(rawComponent: Component) {
    const em = RequestContext.getEntityManager();
    if (!rawComponent.packageName || !rawComponent.componentName) {
      throw new LogicException('packageName and componentName can not both empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawComponent.scaffoldId) {
      throw new LogicException('scaffoldId can not empty', LogicExceptionCode.ParamEmpty);
    }

    const scaffold = await em.findOne(Scaffold, rawComponent.scaffoldId);

    if (!scaffold) {
      throw new LogicException('scaffold not found', LogicExceptionCode.NotFound);
    }

    const count = await em.count(Component, {
      packageName: rawComponent.packageName,
      componentName: rawComponent.componentName,
    });

    if (count > 0) {
      throw new LogicException('packageName and componentName must unique', LogicExceptionCode.NotUnique);
    }

    const newComponent = em.create(Component, pick(rawComponent, ['name', 'componentName', 'packageName', 'container']));
    newComponent.scaffold = scaffold;
    await em.flush();

    em.create(ComponentVersion, {
      name: '0.0.1',
      component: newComponent
    });

    await em.flush();

    return newComponent;
  }

  async list(container: string) {
    const em = RequestContext.getEntityManager();

    const list = await em.find(Component, { container: container === 'true' });

    return list;
  }
}



