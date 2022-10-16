import { PropValueType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { LogicException } from 'config/logic.exception';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';


@Injectable()
export class PropValueService {
  async abstractTypeAdd(rawPropValue: PropValue) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawPropValue.type, 'type');
    LogicException.assertParamEmpty(rawPropValue.propItemId, 'propItemId');
    LogicException.assertParamEmpty(rawPropValue.componentId, 'componentId');
    LogicException.assertParamEmpty(rawPropValue.componentVersionId, 'componentVersionId');
    const query = {
      propItem: rawPropValue.propItemId,
      abstractValueIdChain: rawPropValue.abstractValueIdChain,
      component: rawPropValue.componentId,
      componentVersion: rawPropValue.componentVersionId,
      type: rawPropValue.type,
    } as any;
    if (rawPropValue.type === PropValueType.Instance) {
      LogicException.assertParamEmpty(rawPropValue.componentInstanceId, 'componentInstanceId');
      query.componentInstance = rawPropValue.componentInstanceId;
    }

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

    LogicException.assertParamEmpty(propValueId, 'propValueId');
    const propValue = await em.findOne(PropValue, propValueId);

    await em.begin();
    try {
      await em.nativeDelete(PropValue, {
        abstractValueIdChain: { $like: `${propValue.id}` },
        component: propValue.componentId,
        componentVersion: propValue.componentVersionId,
      });
      await em.removeAndFlush(propValue);

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

  }

  async update(rawPropValue: PropValue) {
    const em = RequestContext.getEntityManager();

    if (rawPropValue.id) {
      const propValue = await em.findOne(PropValue, rawPropValue.id);
      LogicException.assertNotFound(propValue, 'PropValue', rawPropValue.id);

      propValue.value = rawPropValue.value;
      await em.flush();
      return null;
    } else if (rawPropValue.type === 'instance') {
      LogicException.assertParamEmpty(rawPropValue.propItemId, 'propItemId');
      LogicException.assertParamEmpty(rawPropValue.componentId, 'componentId');
      LogicException.assertParamEmpty(rawPropValue.componentVersionId, 'componentVersionId');
      LogicException.assertParamEmpty(rawPropValue.componentInstanceId, 'componentInstanceId');

      const newPropValue = em.create(PropValue, {
        propItem: rawPropValue.propItemId,
        component: rawPropValue.componentId,
        componentVersion: rawPropValue.componentVersionId,
        value: rawPropValue.value,
        abstractValueIdChain: rawPropValue.abstractValueIdChain,
        componentInstance: rawPropValue.componentInstanceId,
        type: PropValueType.Instance
      });
      await em.flush();
      return newPropValue;
    } else {
      if (rawPropValue.abstractValueIdChain) {
        LogicException.assertParamEmpty(rawPropValue.propItemId, 'propItemId');
        LogicException.assertParamEmpty(rawPropValue.componentId, 'componentId');
        LogicException.assertParamEmpty(rawPropValue.componentVersionId, 'componentVersionId');

        const newPropValue = em.create(PropValue, {
          propItem: rawPropValue.propItemId,
          component: rawPropValue.componentId,
          componentVersion: rawPropValue.componentVersionId,
          value: rawPropValue.value,
          type: PropValueType.Prototype,
          abstractValueIdChain: rawPropValue.abstractValueIdChain
        });

        await em.flush();
        return newPropValue;
      } else {
        LogicException.assertParamEmpty(rawPropValue.propItemId, 'propItemId');
        const propItem = await em.findOne(PropItem, rawPropValue.propItemId);
        LogicException.assertNotFound(propItem, 'PropItem', rawPropValue.propItemId);
        propItem.defaultValue = rawPropValue.value;
        await em.flush();
        return null;
      }
    }
  }
}



