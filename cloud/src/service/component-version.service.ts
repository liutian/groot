import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { ComponentVersion } from 'entities/ComponentVersion';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';
import { PropBlockService } from './prop-block.service';
import { PropGroupService } from './prop-group.service';
import { PropItemService } from './prop-item.service';

import { pick } from 'util/common';
import { PropValueType } from '@grootio/common';

const tempIdData = {
  itemId: 1,
  blockId: 1,
  groupId: 1,
  valueId: 1
}


@Injectable()
export class ComponentVersionService {

  constructor(
    public propGroupService: PropGroupService,
    public propBlockService: PropBlockService,
    public propItemService: PropItemService
  ) { }

  async add(rawComponentVersion: ComponentVersion) {
    const em = RequestContext.getEntityManager();
    if (!rawComponentVersion.name) {
      throw new LogicException('name can not empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawComponentVersion.imageVersionId) {
      throw new LogicException('imageVersionId can not empty', LogicExceptionCode.ParamEmpty);
    }

    const imageComponentVersion = await em.findOne(ComponentVersion, rawComponentVersion.imageVersionId,
      {
        populate: ['groupList', 'blockList', 'itemList', 'valueList'],
        populateWhere: { valueList: { type: PropValueType.Prototype } }
      }
    );
    if (!imageComponentVersion) {
      throw new LogicException(`componentVersion not found id:${rawComponentVersion.imageVersionId}`, LogicExceptionCode.NotFound);
    }

    const count = await em.count(ComponentVersion, { component: imageComponentVersion.component, name: rawComponentVersion.name });

    if (count > 0) {
      throw new LogicException(`componentVersion name conflict name:${rawComponentVersion.name}`, LogicExceptionCode.NotUnique);
    }

    const originGroupList = imageComponentVersion.groupList.getItems();
    const originBlockList = imageComponentVersion.blockList.getItems();
    const originItemList = imageComponentVersion.itemList.getItems();
    const originValueList = imageComponentVersion.valueList.getItems();

    const groupMap = new Map<number, PropGroup>();
    const blockMap = new Map<number, PropBlock>();
    const itemMap = new Map<number, PropItem>();
    const valueMap = new Map<number, PropValue>();

    const componentVersion = em.create(ComponentVersion, {
      name: rawComponentVersion.name,
      component: imageComponentVersion.component
    });

    await em.begin();
    try {

      await em.flush();

      for (let groupIndex = 0; groupIndex < originGroupList.length; groupIndex++) {
        const originGroup = originGroupList[groupIndex];
        const group = em.create(PropGroup, {
          ...pick(originGroup,
            ['name', 'root', 'propKey', 'order', 'component', 'struct']
          ),
          componentVersion
        }
        );
        groupMap.set(originGroup.id, group);
      }

      for (let blockIndex = 0; blockIndex < originBlockList.length; blockIndex++) {
        const originBlock = originBlockList[blockIndex];
        const block = em.create(PropBlock, {
          ...pick(originBlock,
            ['name', 'rootPropKey', 'propKey', 'order', 'component', 'struct', 'layout']
          ),
          componentVersion,
          group: tempIdData.groupId
        }
        );
        blockMap.set(originBlock.id, block);
      }

      for (let itemIndex = 0; itemIndex < originItemList.length; itemIndex++) {
        const originItem = originItemList[itemIndex];
        const item = em.create(PropItem, {
          ...pick(originItem,
            ['label', 'propKey', 'type', 'valueOptions', 'span', 'rootPropKey', 'order', 'component', 'versionTraceId', 'defaultValue']
          ),
          componentVersion,
          block: tempIdData.blockId,
          group: tempIdData.groupId,
        });
        itemMap.set(originItem.id, item);
      }

      for (let valueIndex = 0; valueIndex < originValueList.length; valueIndex++) {
        const originValue = originValueList[valueIndex];
        const value = em.create(PropValue, {
          ...pick(originValue,
            ['value', 'abstractValueIdChain', 'component', 'application', 'project', 'scaffold', 'type', 'order']
          ),
          componentVersion,
          propItem: tempIdData.itemId
        });
        valueMap.set(originValue.id, value);
      }

      await em.flush();
      /////////////////////////////////////////////////////////////////////////////////////////////////////////

      for (let valueIndex = 0; valueIndex < originValueList.length; valueIndex++) {
        const originValue = originValueList[valueIndex];
        const value = valueMap.get(originValue.id);
        value.propItem = itemMap.get(originValue.propItem.id);
        if (originValue.abstractValueIdChain) {
          const valueIdList = originValue.abstractValueIdChain.split(',');
          const newValueIdList = valueIdList.map((valueId) => {
            return valueMap.get(+valueId).id;
          });
          value.abstractValueIdChain = newValueIdList.join(',');
        }
      }

      for (let itemIndex = 0; itemIndex < originItemList.length; itemIndex++) {
        const originItem = originItemList[itemIndex];
        const item = itemMap.get(originItem.id);
        item.block = blockMap.get(originItem.block.id);
        item.group = groupMap.get(originItem.group.id);
        if (originItem.childGroup) {
          item.childGroup = groupMap.get(originItem.childGroup.id);;
        }
      }

      for (let blockIndex = 0; blockIndex < originBlockList.length; blockIndex++) {
        const originBlock = originBlockList[blockIndex];
        const block = blockMap.get(originBlock.id);
        block.group = groupMap.get(originBlock.group.id);

        if (originBlock.listStructData) {
          const itemIdList = JSON.parse(originBlock.listStructData) as number[];
          const newListStructData = itemIdList.map((itemId) => {
            return itemMap.get(itemId).id;
          });
          block.listStructData = JSON.stringify(newListStructData);
        }
      }

      for (let groupIndex = 0; groupIndex < originGroupList.length; groupIndex++) {
        const originGroup = originGroupList[groupIndex];
        const group = groupMap.get(originGroup.id);
        if (originGroup.parentItem) {
          group.parentItem = itemMap.get(originGroup.parentItem.id);
        }
      }

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    return componentVersion;
  }

}



