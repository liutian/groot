import { PropValueType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';


@Injectable()
export class PropValueService {
  async blockListStructAdd(rawPropValue: PropValue) {
    const em = RequestContext.getEntityManager();

    const query = {
      propItem: rawPropValue.propItemId,
      propValueIdChainForBlockListStruct: rawPropValue.propValueIdChainForBlockListStruct,
      component: rawPropValue.componentId,
      componentVersion: rawPropValue.componentVersionId,
      scaffold: rawPropValue.scaffoldId,
      type: PropValueType.Prototype_List,
    };

    const lastPropValue = await em.findOne(PropValue, query, { orderBy: { order: 'DESC' } });

    const newPropValue = em.create(PropValue, {
      ...query,
      order: (lastPropValue?.order || 0) + 1000
    });

    await em.flush();

    return newPropValue;
  }

  async blockListStructRemove(propValueId: number) {
    const em = RequestContext.getEntityManager();

    const propValue = await em.findOne(PropValue, propValueId);

    await em.nativeDelete(PropValue, {
      propValueIdChainForBlockListStruct: { $like: `${propValue.id}` },
      component: propValue.componentId,
      componentVersion: propValue.componentVersionId,
      scaffold: propValue.scaffoldId,
      type: { $ne: PropValueType.Default }
    });

    em.remove(propValue);

    await em.flush();

  }

  async updateForPrototype(rawPropValue: PropValue) {
    const em = RequestContext.getEntityManager();

    if (rawPropValue.id) {
      const propValue = await em.findOne(PropValue, rawPropValue.id);
      if (!propValue) {
        throw new LogicException(`not found propValue id: ${rawPropValue.id}`, LogicExceptionCode.NotFound);
      }

      propValue.value = rawPropValue.value;
      await em.flush();

      return null;
    } else if (rawPropValue.propValueIdChainForBlockListStruct) {
      const newPropValue = em.create(PropValue, {
        propValueIdChainForBlockListStruct: rawPropValue.propValueIdChainForBlockListStruct,
        propItem: rawPropValue.propItemId,
        component: rawPropValue.componentId,
        componentVersion: rawPropValue.componentVersionId,
        scaffold: rawPropValue.scaffoldId,
        value: rawPropValue.value,
        type: PropValueType.Prototype
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



