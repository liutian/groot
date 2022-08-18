import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
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
    });

    newInstance.releaseList.add(release);

    await em.flush();

    return newInstance;
  }
}



