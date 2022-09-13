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

    LogicException.assertParamEmpty(rawPropValue.type, 'type');

    const query = {
      propItem: rawPropValue.propItemId,
      abstractValueIdChain: rawPropValue.abstractValueIdChain,
      component: rawPropValue.componentId,
      componentVersion: rawPropValue.componentVersionId,
      scaffold: rawPropValue.scaffoldId,
      type: rawPropValue.type,
    } as any;

    if (rawPropValue.type === PropValueType.Instance) {
      query.release = rawPropValue.releaseId;
      query.componentInstance = rawPropValue.componentInstanceId
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

    const propValue = await em.findOne(PropValue, propValueId);

    await em.nativeDelete(PropValue, {
      abstractValueIdChain: { $like: `${propValue.id}` },
      component: propValue.componentId,
      componentVersion: propValue.componentVersionId,
    });

    em.remove(propValue);

    await em.flush();

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
        const propItem = await em.findOne(PropItem, rawPropValue.propItemId);
        LogicException.assertNotFound(propItem, 'PropItem', rawPropValue.propItemId);
        propItem.defaultValue = rawPropValue.value;
        await em.flush();
        return null;
      }
    }
  }
}



