import { PropValueType } from '@grootio/common';
import { EntityManager, RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';
import { Release } from 'entities/Release';

import { pick } from 'util/common';

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
      if (rawInstance.rootId) {
        throw new LogicException(`如果传递参数path，则不能传递参数rootId`, LogicExceptionCode.UnExpect);
      }

      if (rawInstance.parentId) {
        throw new LogicException(`如果传递参数path，则不能传递参数parentId`, LogicExceptionCode.UnExpect);
      }

      const count = await em.count(ComponentInstance, {
        path: rawInstance.path,
        release
      });

      if (count > 0) {
        throw new LogicException(`参数path冲突，改值必须在迭代版本中唯一`, LogicExceptionCode.NotUnique);
      }
    } else {
      if (!rawInstance.parentId) {
        throw new LogicException(`如果不传递参数path，则必须传递参数parentId`, LogicExceptionCode.UnExpect);
      }

      if (!rawInstance.rootId) {
        throw new LogicException(`如果不传递参数path，则必须传递参数rootId`, LogicExceptionCode.UnExpect);
      }
    }

    const valueMap = new Map<number, PropValue>();
    const newValueList = [];

    const prototypeValueList = await em.find(PropValue, {
      component,
      componentVersion: component.recentVersion,
      type: PropValueType.Prototype
    });

    const newInstance = em.create(ComponentInstance, {
      ...pick(rawInstance, ['name', 'path', 'parentId', 'rootId']),
      component,
      componentVersion: component.recentVersion,
      release,
      trackId: 0
    });

    let parentCtx = parentEm ? em.getTransactionContext() : undefined;
    await em.begin();
    try {
      // 创建组件实例
      await em.flush();
      // 更新trackId，方便多版本迭代之间跟踪组件实例
      newInstance.trackId = newInstance.id;

      // 创建组件值列表
      prototypeValueList.forEach(propValue => {
        const newPropValue = em.create(PropValue, {
          ...pick(propValue, [
            'propItem', 'value', 'abstractValueIdChain',
            'component', 'componentVersion', 'order'
          ]),
          componentInstance: newInstance,
          type: PropValueType.Instance
        });
        newValueList.push(newPropValue);
        valueMap.set(propValue.id, newPropValue);
      });
      await em.flush();

      // 更新组件值的abstractValueIdChain
      newValueList.forEach(newPropValue => {
        const abstractValueIdChain = (newPropValue.abstractValueIdChain || '').split(',').filter(id => !!id).map(valueId => {
          const oldPropValue = valueMap.get(+valueId);
          if (!oldPropValue) {
            throw new LogicException(`找不到对应的propValue，id: ${valueId}`, LogicExceptionCode.UnExpect);
          }
          return oldPropValue.id;
        }).join(',');

        newPropValue.abstractValueIdChain = abstractValueIdChain;
      });
      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      if (parentCtx) {
        em.setTransactionContext(parentCtx);
      }
    }

    return newInstance;
  }

  // todo **id为componentInstanceId**
  async getPageDetail(instanceId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(instanceId, 'instanceId');
    const pageInstance = await em.findOne(ComponentInstance, instanceId, {
      populate: ['componentVersion', 'component']
    });
    LogicException.assertNotFound(pageInstance, 'pageInstance', instanceId);
    if (!pageInstance.path) {
      throw new LogicException(`组件实例path为空`, LogicExceptionCode.UnExpect);
    }

    pageInstance.groupList = await em.find(PropGroup, { component: pageInstance.component, componentVersion: pageInstance.componentVersion });
    pageInstance.blockList = await em.find(PropBlock, { component: pageInstance.component, componentVersion: pageInstance.componentVersion });
    pageInstance.itemList = await em.find(PropItem, { component: pageInstance.component, componentVersion: pageInstance.componentVersion });
    pageInstance.valueList = await em.find(PropValue, { componentInstance: pageInstance });

    const instanceList = await em.find(ComponentInstance, { root: instanceId }, {
      populate: ['component', 'componentVersion'],
    });

    for (let index = 0; index < instanceList.length; index++) {
      const instance = instanceList[index];

      instance.groupList = await em.find(PropGroup, { component: instance.component, componentVersion: instance.componentVersion });
      instance.blockList = await em.find(PropBlock, { component: instance.component, componentVersion: instance.componentVersion });
      instance.itemList = await em.find(PropItem, { component: instance.component, componentVersion: instance.componentVersion });
      instance.valueList = await em.find(PropValue, { componentInstance: instance });
    }

    return { root: pageInstance, children: instanceList };
  }

  async detailIdByTrackId(trackId: number, releaseId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(trackId, 'trackId');
    LogicException.assertParamEmpty(releaseId, 'releaseId');
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
    let removeIds = [id];

    const instance = await em.findOne(ComponentInstance, id);

    LogicException.assertNotFound(instance, 'ComponentInstance', id);

    if (instance.path) {
      const list = await em.find(ComponentInstance, { root: id });
      removeIds.push(...list.map(item => item.id));
    } else {
      let parentIds = [id];
      do {
        const instance = await em.findOne(ComponentInstance, parentIds.shift());
        const childList = await em.find(ComponentInstance, { parent: instance.id });
        childList.forEach((child) => {
          removeIds.push(child.id);
          parentIds.push(child.id);
        })
      } while (parentIds.length);
    }

    await em.nativeDelete(ComponentInstance, { id: { $in: removeIds } });
  }
}



