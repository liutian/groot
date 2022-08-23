import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Release } from 'entities/Release';

@Injectable()
export class ComponentInstanceService {
  async addPage(rawInstance: ComponentInstance) {
    const em = RequestContext.getEntityManager();
    if (!rawInstance.name) {
      throw new LogicException('name can not empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawInstance.componentId) {
      throw new LogicException('componentId can not empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawInstance.path) {
      throw new LogicException('path can not empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawInstance.releaseId) {
      throw new LogicException('releaseId can not empty', LogicExceptionCode.ParamEmpty);
    }

    const component = await em.findOne(Component, rawInstance.componentId);
    if (!component) {
      throw new LogicException(`can not found component id:${rawInstance.componentId}`, LogicExceptionCode.NotFound);
    }

    const release = await em.findOne(Release, rawInstance.releaseId);
    if (!release) {
      throw new LogicException(`can not found release id:${rawInstance.releaseId}`, LogicExceptionCode.NotFound);
    }

    const newInstance = em.create(ComponentInstance, {
      name: rawInstance.name,
      path: rawInstance.path,
      component,
      componentVersion: component.recentVersion,
      release
    });

    await em.flush();

    return newInstance;
  }

  // todo **id为componentInstanceId**
  async getComponent(instancceId: number, releaseId?: number) {
    const em = RequestContext.getEntityManager();

    const instance = await em.findOne(ComponentInstance, { id: instancceId, release: releaseId }, { populate: ['propValueList'] });

    if (!instance) {
      throw new LogicException('not found instance', LogicExceptionCode.NotFound);
    }

    const component = await em.findOne(Component, instance.component.id);
    component.instance = wrap(instance).toObject() as any;

    // const release = await em.findOne(Release, releaseId);
    // if (!release) {
    //   throw new LogicException(`not found release id:${releaseId}`, LogicExceptionCode.NotFound);
    // }
    // component.release = wrap(release).toObject() as any;

    const version = await em.findOne(ComponentVersion, instance.componentVersion,
      { populate: ['groupList', 'blockList', 'itemList', 'valueList'] }
    );
    component.version = wrap(version).toObject() as any;

    // const instanceList = await em.find(ComponentInstance, { component },
    //   { populate: ['releaseList'] }
    // );
    // const releaseSet = instanceList.reduce<Set<Release>>((pre, { releaseList }) => {
    //   releaseList.getItems().forEach((item) => {
    //     pre.add(wrap(item).toObject() as any);
    //   })
    //   return pre;
    // }, new Set<Release>());
    // component.releaseList = [...releaseSet];

    return component;
  }
}



