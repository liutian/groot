import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/Logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem, PropItemType } from 'entities/PropItem';
import { PropValueOption } from 'entities/PropValueOption';
import { autoIncrementForName, pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';
import { PropGroupService } from './PropGroup.service';


@Injectable()
export class PropBlockService {

  constructor(private propGroupService: PropGroupService) { }

  async add(rawBlock: PropBlock) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, rawBlock.groupId);
    if (!group) {
      return;
    }

    const firstBlock = await em.findOne(PropBlock, { group: group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
    const order = rawBlock.order ? rawBlock.order : (firstBlock ? firstBlock.order + 1000 : 1000);

    const newBlock = em.create(PropBlock, {
      ...pick(rawBlock, ['name', 'propKey', 'rootPropKey', 'isTemplate']),
      group,
      component: group.component,
      componentVersion: group.componentVersion,
      order
    });

    await em.flush();

    return newBlock;
  }

  async addFromTemplate(groupId: number) {
    const em = RequestContext.getEntityManager();

    const groupIdList = [];
    const blockIdList = [];
    const itemIdList = [];

    await em.begin();
    try {

      const group = await em.findOne(PropGroup, groupId, {
        populate: [
          'templateBlock.propItemList.optionList'
        ]
      });

      if (!group || !group.templateBlock) {
        throw new LogicException(`not found groupId:${groupId}`, LogicExceptionCode.NotFound);
      }

      await this.shallowAddFromTemplate(group, group.templateBlock, em, groupIdList, blockIdList, itemIdList);

      await em.commit();

    } catch (e) {
      await em.rollback();
      throw e;
    }

    const groupList = [];
    const blockList = [];
    const itemList = [];

    for (let groupIdIndex = 0; groupIdIndex < groupIdList.length; groupIdIndex++) {
      const groupId = groupIdList[groupIdIndex];
      const group = await em.findOne(PropGroup, groupId);
      omitProps(group, [
        'propBlockList',
      ]);
      groupList.push(group);
    }

    for (let blockIdIndex = 0; blockIdIndex < blockIdList.length; blockIdIndex++) {
      const blockId = blockIdList[blockIdIndex];
      const block = await em.findOne(PropBlock, blockId);
      omitProps(block, [
        'propItemList',
      ]);
      blockList.push(block);
    }

    for (let itemIdIndex = 0; itemIdIndex < itemIdList.length; itemIdIndex++) {
      const itemId = itemIdList[itemIdIndex];
      const item = await em.findOne(PropItem, itemId, { populate: ['optionList'] });
      itemList.push(item);
    }

    return {
      groupList, blockList, itemList
    }
  }

  private async shallowAddFromTemplate(group: PropGroup, copyBlock: PropBlock, em: EntityManager, groupIdList: number[], blockIdList: number[], itemIdList: number[]) {

    const childrenBlock = await em.find(PropBlock, { group, isTemplate: false }, { orderBy: { order: 'DESC' } });
    const newBlock = em.create(PropBlock, pick(group, [
      'componentVersion', 'component'
    ]));
    const nameSuffix = autoIncrementForName(childrenBlock.map(block => block.name));
    newBlock.name = `配置块${nameSuffix}`;
    newBlock.relativeItem = group.relativeItem;
    newBlock.order = childrenBlock.length ? childrenBlock[0].order + 1000 : 1000;
    newBlock.group = group;
    // group.propBlockList.add(newBlock);
    await em.flush();
    blockIdList.push(newBlock.id);

    const copyItemList = copyBlock.propItemList.getItems();
    for (let itemIndex = 0; itemIndex < copyItemList.length; itemIndex++) {
      const copyItem = copyItemList[itemIndex];
      const newItem = em.create(PropItem, pick(copyItem, [
        'label', 'propKey', 'type', 'defaultValue', 'span', 'componentVersion', 'component',
      ]));
      newItem.block = newBlock;
      newItem.order = (itemIndex + 1) * 1000;
      newItem.group = group;
      // newBlock.propItemList.add(newItem);

      const copyOptionList = copyItem.optionList.getItems();
      for (let optionIndex = 0; optionIndex < copyOptionList.length; optionIndex++) {
        const copyOption = copyOptionList[optionIndex];
        const newOption = em.create(PropValueOption, pick(copyOption, ['label', 'value', 'componentVersion', 'component']));
        newOption.propItem = newItem;
        // newItem.optionList.add(newOption);
      }
      await em.flush();
      itemIdList.push(newItem.id);

      if (newItem.type === PropItemType.ARRAY_OBJECT) {
        const innnerTemplateBlock = await em.findOne(PropBlock, copyItem.templateBlock,
          { populate: ['propItemList.optionList'] }
        );

        const valueOfGroup = em.create(PropGroup, {
          name: '关联分组',
          root: false,
          componentVersion: newItem.componentVersion,
          component: newItem.component,
          relativeItem: newItem,
          templateBlock: innnerTemplateBlock,
          order: 0
        });
        newItem.valueOfGroup = valueOfGroup;
        newItem.templateBlock = innnerTemplateBlock;
        await em.flush();
        groupIdList.push(valueOfGroup.id);

        const innerChildrenBlock = await em.find(PropBlock,
          { group: copyItem.valueOfGroup, isTemplate: false },
          { populate: ['propItemList.optionList'] }
        );

        for (let innerBlockIndex = 0; innerBlockIndex < innerChildrenBlock.length; innerBlockIndex++) {
          const innnerBlock = innerChildrenBlock[innerBlockIndex];
          await this.shallowAddFromTemplate(valueOfGroup, innnerBlock, em, groupIdList, blockIdList, itemIdList);
        }
      }
    }
  }

  async movePosition(originId: number, targetId?: number) {
    const em = RequestContext.getEntityManager();
    const originBlock = await em.findOne(PropBlock, originId);

    if (!originBlock) {
      return;
    }

    if (!targetId) {
      const firstBlock = await em.findOne(PropBlock, { group: originBlock.group, isTemplate: false }, { orderBy: { order: 'DESC' } });

      originBlock.order = firstBlock ? firstBlock.order + 1000 : 1000;
    } else {
      const targetBlock = await em.findOne(PropBlock, targetId);
      const targetOrder = targetBlock.order;
      const originOrder = originBlock.order;
      originBlock.order = targetOrder;

      const targetBlockNext = await em.findOne(PropBlock, {
        order: { $gt: targetOrder },
        group: originBlock.group,
      });

      if (!targetBlockNext) {
        targetBlock.order = targetOrder + 1000;
      } else if (targetBlockNext === originBlock) {
        targetBlock.order = originOrder;
      } else {
        targetBlock.order = (targetBlockNext.order + targetOrder) / 2;
      }
    }

    await em.flush();
  }

  async remove(blockId: number) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(PropBlock, blockId, {
      populate: [
        'propItemList.optionList'
      ]
    });

    if (!block) {
      return;
    }

    const innerGroupIds = [];

    await em.begin();
    try {
      const itemList = block.propItemList.getItems();
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];

        for (let optionIndex = 0; optionIndex < item.optionList.length; optionIndex++) {
          const option = item.optionList[optionIndex];
          await em.removeAndFlush(option);
        }

        await em.removeAndFlush(item);
        if (item.type === PropItemType.ARRAY_OBJECT) {
          innerGroupIds.push(item.valueOfGroup.id);
        }
      }

      await em.removeAndFlush(block);
      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    for (let index = 0; index < innerGroupIds.length; index++) {
      const groupId = innerGroupIds[index];
      await this.propGroupService.remove(groupId);
    }
  }

  async update(rawBlock: PropBlock) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(PropBlock, rawBlock.id);

    pick(rawBlock, ['name', 'propKey', 'rootPropKey'], block);

    await em.flush();
  }
}



