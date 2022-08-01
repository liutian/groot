import { PropBlockStructType, PropItemType, PropValueType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { PropBlock } from 'entities/PropBlock';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';


@Injectable()
export class PropValueService {


  async valueListForPrototypeAdd(rawPropValue: PropValue, em = RequestContext.getEntityManager()) {

    if (!rawPropValue.componentId) {
      const propItem = await em.findOne(PropItem, rawPropValue.propItemId);
      rawPropValue.componentId = propItem.component.id;
    }

    if (!rawPropValue.scaffoldId) {
      const component = await em.findOne(Component, rawPropValue.componentId);
      rawPropValue.scaffoldId = component.scaffold.id;
    }

    const propItem = await em.findOne(PropItem, rawPropValue.propItemId);
    const propBlock = await em.findOne(PropBlock, propItem.block.id);

    const newPropValue = await em.create(PropValue, {
      propItem: rawPropValue.propItemId,
      component: rawPropValue.componentId,
      scaffold: rawPropValue.scaffoldId,
      parentId: rawPropValue.parentId,
      parentIdChain: ''
    });
    if (propBlock.struct === PropBlockStructType.List) {
      newPropValue.type = PropValueType.Prototype_List_Parent;
    } else if (propItem.type === PropItemType.Hierarchy || propItem.type === PropItemType.Flat) {
      newPropValue.type = PropValueType.Prototype_Nest_Parent
    } else {
      newPropValue.type = PropValueType.Prototype;
    }

    if (rawPropValue.parentId) {
      const parentPropValue = await em.findOne(PropValue, rawPropValue.parentId);
      newPropValue.parentIdChain = `${parentPropValue.parentIdChain || ''},${rawPropValue.parentId}`;
      if (parentPropValue.propItem.id === rawPropValue.propItemId) {
        newPropValue.type = PropValueType.Prototype_List_Child;
        parentPropValue.value = `${parentPropValue.value},${newPropValue.id}`;
      }
    }

    await em.flush();

    return newPropValue;
  }

  async valueListForPrototypeRemove(id: number) {
    const em = RequestContext.getEntityManager();
    const propValue = await em.findOne(PropValue, id);

    await em.begin();
    try {
      await em.nativeDelete(PropValue, {
        parentIdChain: { $like: `${id}` },
        component: propValue.component.id,
        scaffold: propValue.scaffold.id
      });

      await em.remove(propValue);

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }
  }

  async valueListForPrototypeUpdateOrder(propValueId: number, value: string) {
    const em = RequestContext.getEntityManager();

    const newPropValue = await em.findOne(PropValue, propValueId);
    newPropValue.value = value;
    em.flush();
  }
}



