import { PropValueType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';


@Injectable()
export class PropValueService {
  async abstractTypeAdd(rawPropValue: PropValue) {
    const em = RequestContext.getEntityManager();

    const query = {
      propItem: rawPropValue.propItemId,
      abstractValueIdChain: rawPropValue.abstractValueIdChain,
      component: rawPropValue.componentId,
      componentVersion: rawPropValue.componentVersionId,
      scaffold: rawPropValue.scaffoldId,
      type: rawPropValue.type,
    };

    const lastPropValue = await em.findOne(PropValue, query, { orderBy: { order: 'DESC' } });

    const newPropValue = em.create(PropValue, {
      ...query,
      order: (lastPropValue?.order || 0) + 1000
    });

    await em.flush();

    return newPropValue;
  }

  async abstractTypeRemove(propValueId: number) {
    const em = RequestContext.getEntityManager();

    const propValue = await em.findOne(PropValue, propValueId);

    await em.nativeDelete(PropValue, {
      abstractValueIdChain: { $like: `${propValue.id}` },
      component: propValue.componentId,
      componentVersion: propValue.componentVersionId,
      scaffold: propValue.scaffoldId,
    });

    em.remove(propValue);

    await em.flush();

  }

  async update(rawPropValue: PropValue, type: 'prototype' | 'instance') {
    const em = RequestContext.getEntityManager();

    if (rawPropValue.id) {
      const propValue = await em.findOne(PropValue, rawPropValue.id);
      if (!propValue) {
        throw new LogicException(`not found propValue id: ${rawPropValue.id}`, LogicExceptionCode.NotFound);
      }

      propValue.value = rawPropValue.value;
      await em.flush();
      return null;
    } else if (type === 'instance') {
      const newPropValue = em.create(PropValue, {
        propItem: rawPropValue.propItemId,
        component: rawPropValue.componentId,
        componentVersion: rawPropValue.componentVersionId,
        scaffold: rawPropValue.scaffoldId,
        value: rawPropValue.value,
        abstractValueIdChain: rawPropValue.abstractValueIdChain,
        release: rawPropValue.releaseId,
        componentInstance: rawPropValue.componentInstanceId,
        type: rawPropValue.abstractValueIdChain ? PropValueType.Instance_List_Item : PropValueType.Default
      });
      await em.flush();
      return newPropValue;
    } else {
      if (rawPropValue.abstractValueIdChain) {
        const newPropValue = em.create(PropValue, {
          propItem: rawPropValue.propItemId,
          component: rawPropValue.componentId,
          componentVersion: rawPropValue.componentVersionId,
          scaffold: rawPropValue.scaffoldId,
          value: rawPropValue.value,
          type: PropValueType.Prototype_List_Item,
          abstractValueIdChain: rawPropValue.abstractValueIdChain
        });

        await em.flush();
        return newPropValue;
      } else {
        const propItem = await em.findOne(PropItem, rawPropValue.propItemId);
        if (!propItem) {
          throw new LogicException(`not found propItem id: ${rawPropValue.propItemId}`, LogicExceptionCode.NotFound);
        }
        propItem.defaultValue = rawPropValue.value;
        await em.flush();
        return null;
      }
    }
  }
}



