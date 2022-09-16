import { PropValueType } from '@grootio/common';
import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentVersion } from 'entities/ComponentVersion';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';
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
  async getComponentPrototype(id: number, versionId: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id);

    LogicException.assertNotFound(component, 'Component', id);

    LogicException.assertParamEmpty(versionId, 'versionId');

    component.versionList = await em.find(ComponentVersion, { component });

    const version = await em.findOne(ComponentVersion, versionId);
    LogicException.assertNotFound(version, 'ComponentVersion', versionId);
    component.version = wrap(version).toObject() as any;

    component.groupList = await em.find(PropGroup, { component: id, componentVersion: versionId });
    component.blockList = await em.find(PropBlock, { component: id, componentVersion: versionId });
    component.itemList = await em.find(PropItem, { component: id, componentVersion: versionId });
    component.valueList = await em.find(PropValue, { component: id, componentVersion: versionId, type: PropValueType.Prototype });

    return component;
  }

  async add(rawComponent: Component) {
    const em = RequestContext.getEntityManager();
    if (!rawComponent.packageName || !rawComponent.componentName) {
      throw new LogicException('packageName and componentName can not both empty', LogicExceptionCode.ParamEmpty);
    }
    LogicException.assertParamEmpty(rawComponent.scaffoldId, 'scaffoldId');

    const scaffold = await em.findOne(Scaffold, rawComponent.scaffoldId);

    LogicException.assertNotFound(scaffold, 'Scaffold', rawComponent.scaffoldId);

    const newComponent = em.create(Component, pick(rawComponent, ['name', 'componentName', 'packageName', 'container']));
    newComponent.scaffold = scaffold;

    await em.begin();

    try {
      await em.flush();

      const newVersion = em.create(ComponentVersion, {
        name: '0.0.1',
        component: newComponent
      });

      await em.flush();

      newComponent.recentVersion = newVersion;

      await em.flush();

      em.create(PropGroup, {
        name: '常用配置',
        order: 1000,
        componentVersion: newVersion,
        component: newComponent
      });

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }


    return newComponent;
  }

  async list(container: string) {
    const em = RequestContext.getEntityManager();

    const list = await em.find(Component, { container: container === 'true' });

    return list;
  }
}



