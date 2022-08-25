import { PropValueType } from '@grootio/common';
import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { PropValue } from 'entities/PropValue';
import { Release } from 'entities/Release';

import { pick } from 'util/common';

@Injectable()
export class ComponentInstanceService {
  async add(rawInstance: ComponentInstance) {
    const em = RequestContext.getEntityManager();
    if (!rawInstance.name) {
      throw new LogicException('name can not empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawInstance.componentId) {
      throw new LogicException('componentId can not empty', LogicExceptionCode.ParamEmpty);
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

    const valueMap = new Map<number, PropValue>();
    const newValueList = [];

    await em.begin();
    try {

      await em.flush();

      const valueList = await em.find(PropValue, {
        component,
        componentVersion: component.recentVersion,
        type: PropValueType.Prototype
      });

      valueList.forEach(propValue => {
        const newPropValue = em.create(PropValue, {
          ...pick(propValue, [
            'propItem', 'value', 'componentInstance', 'abstractValueIdChain',
            'component', 'componentVersion', 'application', 'project', 'scaffold', 'order'
          ]),
          release,
          componentInstance: newInstance,
          type: PropValueType.Instance
        });
        newValueList.push(newPropValue);
        valueMap.set(propValue.id, newPropValue);
      });

      await em.flush();

      newValueList.forEach(newPropValue => {
        const abstractValueIdChain = (newPropValue.abstractValueIdChain?.split(',') || []).filter(id => !!id).map(valueId => {
          return valueMap.get(+valueId).id;
        }).join(',');

        newPropValue.abstractValueIdChain = abstractValueIdChain;
      });

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    return newInstance;
  }

  // todo **id为componentInstanceId**
  async getComponent(instancceId: number, releaseId: number) {
    const em = RequestContext.getEntityManager();

    const instance = await em.findOne(ComponentInstance, { id: instancceId, release: releaseId }, {
      populate: ['valueList'],
      populateWhere: { valueList: { type: PropValueType.Instance } }
    });

    if (!instance) {
      throw new LogicException('not found instance', LogicExceptionCode.NotFound);
    }

    const component = await em.findOne(Component, instance.component.id);
    component.instance = wrap(instance).toObject() as any;

    const version = await em.findOne(ComponentVersion, instance.componentVersion,
      {
        populate: ['groupList', 'blockList', 'itemList'],
      }
    );
    component.version = wrap(version).toObject() as any;

    return component;
  }
}



