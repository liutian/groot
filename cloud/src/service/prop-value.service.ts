import { PropValueType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
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

    const newPropValue = await em.create(PropValue, {
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

}



