import { EntityManager, RequestContext } from '@mikro-orm/core';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem, PropItemType } from 'entities/PropItem';
import { PropValueOption } from 'entities/PropValueOption';
import { autoIncrementForName, pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';
import { PropGroupService } from './prop-group.service';


@Injectable()
export class PropBlockService {

  constructor(
    @Inject(forwardRef(() => PropGroupService))
    private propGroupService: PropGroupService
  ) { }

  async add(rawBlock: PropBlock) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, rawBlock.groupId);
    if (!group) {
      throw new LogicException(`not found group id: ${rawBlock.groupId}`, LogicExceptionCode.NotFound);
    }

    const firstBlock = await em.findOne(PropBlock, { group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
    const order = rawBlock.order ? rawBlock.order : (firstBlock ? firstBlock.order + 1000 : 1000);

    const newBlock = em.create(PropBlock, {
      ...pick(rawBlock, ['name', 'propKey', 'rootPropKey', 'isTemplate']),
      component: group.component,
      componentVersion: group.componentVersion,
      group,
      order
    });

    await em.flush();

    return newBlock;
  }

  async addFromTemplate(groupId: number) {
    const em = RequestContext.getEntityManager()!;

    const groupIdList: number[] = [];
    const blockIdList: number[] = [];
    const itemIdList: number[] = [];

    await em.begin();
    try {

      const group = await em.findOne(PropGroup, groupId, {
        populate: [
          'templateBlock.propItemList.optionList'
        ]
      });

      if (!group) {
        throw new LogicException(`not found groupId:${groupId}`, LogicExceptionCode.NotFound);
      } else if (!group.templateBlock) {
        throw new LogicException(`templateBlock not exists groupId: ${groupId}`, LogicExceptionCode.NotFound);
      }

      await this.shallowCloneFromTemplateBlock(group, group.templateBlock, em, groupIdList, blockIdList, itemIdList);

      await em.commit();

    } catch (e) {
      await em.rollback();
      throw e;
    }

    const groupList: PropGroup[] = [];
    const blockList: PropBlock[] = [];
    const itemList: PropItem[] = [];

    for (let groupIdIndex = 0; groupIdIndex < groupIdList.length; groupIdIndex++) {
      const groupId = groupIdList[groupIdIndex];
      const group = await em.findOne(PropGroup, groupId);

      if (!group) {
        throw new LogicException(`not found group id: ${groupId}`, LogicExceptionCode.NotFound);
      }

      omitProps(group, [
        'propBlockList',
      ]);
      groupList.push(group);
    }

    for (let blockIdIndex = 0; blockIdIndex < blockIdList.length; blockIdIndex++) {
      const blockId = blockIdList[blockIdIndex];
      const block = await em.findOne(PropBlock, blockId);

      if (!block) {
        throw new LogicException(`not found block id:${blockId}`, LogicExceptionCode.NotFound);
      }

      omitProps(block, [
        'propItemList',
      ]);
      blockList.push(block);
    }

    for (let itemIdIndex = 0; itemIdIndex < itemIdList.length; itemIdIndex++) {
      const itemId = itemIdList[itemIdIndex];
      const item = await em.findOne(PropItem, itemId, { populate: ['optionList'] });

      if (!item) {
        throw new LogicException(`not found item id:${itemId}`, LogicExceptionCode.NotFound);
      }

      itemList.push(item);
    }

    return {
      groupList, blockList, itemList
    }
  }

  async movePosition(originId: number, targetId: number) {
    const em = RequestContext.getEntityManager();
    const originBlock = await em.findOne(PropBlock, originId);

    if (!originBlock) {
      throw new LogicException(`not found block id: ${originId}`, LogicExceptionCode.NotFound);
    }

    const targetBlock = await em.findOne(PropBlock, targetId);

    if (!targetBlock) {
      throw new LogicException(`not found block id:${targetId}`, LogicExceptionCode.NotFound);
    }

    const order = targetBlock.order;
    targetBlock.order = originBlock.order;
    originBlock.order = order;

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
      throw new LogicException(`not found block id : ${blockId}`, LogicExceptionCode.NotFound);
    }

    const innerGroupIds: number[] = [];

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
        if (item.type === PropItemType.LIST) {
          innerGroupIds.push(item.valueOfGroup!.id);
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

  /**
   * 从分组模版中浅克隆
   */
  private async shallowCloneFromTemplateBlock(group: PropGroup, cloneBlock: PropBlock, em: EntityManager, groupIdList: number[], blockIdList: number[], itemIdList: number[]) {

    const childrenBlock = await em.find(PropBlock, { group, isTemplate: false }, { orderBy: { order: 'DESC' } });
    const newBlock = em.create(PropBlock, pick(group, [
      'componentVersion', 'component'
    ]));
    const nameSuffix = autoIncrementForName(childrenBlock.map(block => block.name));
    newBlock.name = `配置块${nameSuffix}`;
    newBlock.relativeItem = group.relativeItem;
    newBlock.order = childrenBlock.length ? childrenBlock[0].order + 1000 : 1000;
    newBlock.group = group;
    if (cloneBlock.imagePropBlock) {
      newBlock.imagePropBlock = cloneBlock.imagePropBlock;
    } else {
      newBlock.imagePropBlock = cloneBlock;
    }
    await em.flush();
    blockIdList.push(newBlock.id);

    const copyItemList = cloneBlock.propItemList.getItems();
    for (let itemIndex = 0; itemIndex < copyItemList.length; itemIndex++) {
      const copyItem = copyItemList[itemIndex];
      await this.shallowCloneFromTemplateItem(group, newBlock, copyItem, em, groupIdList, blockIdList, itemIdList);
    }

    return newBlock;
  }

  private async shallowCloneFromTemplateItem(group: PropGroup, newBlock: PropBlock, copyItem: PropItem, em: EntityManager, groupIdList: number[], blockIdList: number[], itemIdList: number[]) {
    const newItem = em.create(PropItem, pick(copyItem, [
      'label', 'propKey', 'type', 'defaultValue', 'span', 'componentVersion', 'component', 'order'
    ]));

    newItem.block = newBlock;
    newItem.group = group;
    if (copyItem.imagePropItem) {
      newItem.imagePropItem = copyItem.imagePropItem;
    } else {
      newItem.imagePropItem = copyItem;
    }

    const copyOptionList = copyItem.optionList.getItems();
    for (let optionIndex = 0; optionIndex < copyOptionList.length; optionIndex++) {
      const copyOption = copyOptionList[optionIndex];
      const newOption = em.create(PropValueOption, pick(copyOption, ['label', 'value', 'componentVersion', 'component']));
      newOption.propItem = newItem;
    }
    await em.flush();
    itemIdList.push(newItem.id);

    if (newItem.type === PropItemType.LIST) {
      if (!copyItem.templateBlock) {
        throw new LogicException(`templateBlock not exists itemId: ${newItem.id}`, LogicExceptionCode.NotFound);
      }

      const innnerTemplateBlock = await em.findOne(PropBlock, copyItem.templateBlock,
        { populate: ['propItemList.optionList'] }
      );

      if (!innnerTemplateBlock) {
        throw new LogicException(`not found templateBlock id:${copyItem.templateBlock.id}`, LogicExceptionCode.NotFound);
      }

      const valueOfGroup = em.create(PropGroup, {
        name: '关联分组',
        root: false,
        componentVersion: newItem.componentVersion,
        component: newItem.component,
        relativeItem: newItem,
        templateBlock: innnerTemplateBlock,
        order: 0,
        struct: 'List'
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
        await this.shallowCloneFromTemplateBlock(valueOfGroup, innnerBlock, em, groupIdList, blockIdList, itemIdList);
      }
    } else if (newItem.type === PropItemType.ITEM) {
      const valueOfGroup = em.create(PropGroup, {
        name: '关联分组',
        root: false,
        componentVersion: newItem.componentVersion,
        component: newItem.component,
        relativeItem: newItem,
        order: 0,
        struct: 'Item'
      });
      newItem.valueOfGroup = valueOfGroup;
      await em.flush();
      groupIdList.push(valueOfGroup.id);

      if (copyItem.directBlock) {
        const directBlock = await em.findOne(PropBlock, copyItem.directBlock, {
          populate: ['propItemList.optionList']
        });
        if (!directBlock) {
          throw new LogicException(`not found directBlock copyItem:${copyItem.id}`, LogicExceptionCode.NotFound);
        }

        const newDirectBlock = await this.shallowCloneFromTemplateBlock(valueOfGroup, directBlock, em, groupIdList, blockIdList, itemIdList);
        newItem.directBlock = newDirectBlock;
        await em.flush();
      }
    } else if (newItem.type === PropItemType.HIERARCHY) {
      const valueOfGroup = em.create(PropGroup, {
        name: '关联分组',
        root: false,
        componentVersion: newItem.componentVersion,
        component: newItem.component,
        relativeItem: newItem,
        order: 0,
        struct: 'Default'
      });
      newItem.valueOfGroup = valueOfGroup;
      await em.flush();
      groupIdList.push(valueOfGroup.id);

      const innerChildrenBlock = await em.find(PropBlock,
        { group: copyItem.valueOfGroup },
        { populate: ['propItemList.optionList'] }
      );

      for (let innerBlockIndex = 0; innerBlockIndex < innerChildrenBlock.length; innerBlockIndex++) {
        const innnerBlock = innerChildrenBlock[innerBlockIndex];
        await this.shallowCloneFromTemplateBlock(valueOfGroup, innnerBlock, em, groupIdList, blockIdList, itemIdList);
      }
    }
  }
}



