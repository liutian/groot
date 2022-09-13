import { PropValueType } from '@grootio/common';
import { EntityManager, RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { PropValue } from 'entities/PropValue';
import { Release } from 'entities/Release';

import { pick } from 'util/common';
import { forkTransaction } from 'util/ormUtil';

@Injectable()
export class ComponentInstanceService {
  async add(rawInstance: ComponentInstance, parentEm?: EntityManager) {
    let em = parentEm || RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawInstance.name, 'name');
    LogicException.assertParamEmpty(rawInstance.componentId, 'componentId');
    LogicException.assertParamEmpty(rawInstance.releaseId, 'releaseId');

    const component = await em.findOne(Component, rawInstance.componentId);
    LogicException.assertNotFound(component, 'Component', rawInstance.componentId);

    const release = await em.findOne(Release, rawInstance.releaseId);
    LogicException.assertNotFound(release, 'Release', rawInstance.releaseId);

    if (rawInstance.path) {
      const count = await em.count(ComponentInstance, {
        path: rawInstance.path,
        release
      });

      if (count > 0) {
        throw new LogicException(`path not unique path: ${rawInstance.path}`, LogicExceptionCode.NotUnique);
      }
    } else {
      const count = await em.count(ComponentInstance, {
        name: rawInstance.name,
        release
      });

      if (count > 0) {
        throw new LogicException(`name not unique name: ${rawInstance.name}`, LogicExceptionCode.NotUnique);
      }
    }

    const newInstance = em.create(ComponentInstance, {
      name: rawInstance.name,
      path: rawInstance.path,
      component,
      componentVersion: component.recentVersion,
      release,
      trackId: 0
    });

    const valueMap = new Map<number, PropValue>();
    const newValueList = [];

    let parentCtx = em.getTransactionContext();;
    if (!parentEm) {
      parentCtx = await forkTransaction(em);
    }

    await em.begin();
    try {

      await em.flush();

      newInstance.trackId = newInstance.id;

      const valueList = await em.find(PropValue, {
        component,
        componentVersion: component.recentVersion,
        type: PropValueType.Prototype
      });

      valueList.forEach(propValue => {
        const newPropValue = em.create(PropValue, {
          ...pick(propValue, [
            'propItem', 'value', 'componentInstance', 'abstractValueIdChain',
            'component', 'componentVersion', 'order'
          ]),
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
    } finally {
      em.setTransactionContext(parentCtx);
    }

    return newInstance;
  }

  // todo **id为componentInstanceId**
  async getComponent(instancceId: number) {
    const em = RequestContext.getEntityManager();

    const instance = await em.findOne(ComponentInstance, instancceId, {
      populate: ['valueList'],
      populateWhere: { valueList: { type: PropValueType.Instance } }
    });

    LogicException.assertNotFound(instance, 'ComponentInstance', instancceId);

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

  async detailIdByTrackId(trackId: number, releaseId: number) {
    const em = RequestContext.getEntityManager();

    const instance = await em.findOne(ComponentInstance, { trackId, release: releaseId });

    return instance?.id;
  }

  async addChild(rawComponentInstace: ComponentInstance) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawComponentInstace.id, 'id');

    const parentInstance = await em.findOne(ComponentInstance, rawComponentInstace.id, { populate: ['component'] });
    LogicException.assertNotFound(parentInstance, 'componentInstance', rawComponentInstace.id);

    const component = await em.findOne(Component, rawComponentInstace.componentId);

    let childInstance: ComponentInstance;

    await em.begin();
    try {
      if (rawComponentInstace.oldChildId) {
        await this.remove(rawComponentInstace.oldChildId);
      }

      const rawInstance = {
        name: `内部组件实例 -- ${component.name}`,
        componentId: rawComponentInstace.componentId,
        releaseId: parentInstance.release.id
      } as any;
      childInstance = await this.add(rawInstance);
      childInstance.parent = parentInstance;

      await em.flush();
      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    return childInstance;
  }

  async remove(id: number, em = RequestContext.getEntityManager()) {
    let parentIds = [id];
    let removeIds = [id];

    do {
      const instance = await em.findOne(ComponentInstance, parentIds.shift());
      const childList = await em.find(ComponentInstance, { parent: instance.id });
      childList.forEach((child) => {
        removeIds.push(child.id);
        parentIds.push(child.id);
      })
    } while (parentIds.length);

    await em.nativeDelete(ComponentInstance, { id: { $in: removeIds } });
  }
}



