import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/Logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem, PropItemType } from 'entities/PropItem';
import { PropValueOption } from 'entities/PropValueOption';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';
import { PropGroupService } from './PropGroup.service';


@Injectable()
export class PropBlockService {

  constructor(private propGroupService: PropGroupService) { }

  async add(block: PropBlock) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, block.groupId);
    if (!group) {
      return;
    }

    const firstBlock = await em.findOne(PropBlock, { group: group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
    const order = block.order ? block.order : (firstBlock ? firstBlock.order + 1000 : 1000);

    const newBlock = em.create(PropBlock, {
      ...pick(block, ['name', 'propKey', 'rootPropKey']),
      group,
      componentVersion: group.componentVersion,
      order
    });

    await em.flush();

    omitProps(newBlock, [
      'componentVersion',
      'propItemList.componentVersion',
    ]);

    return newBlock;
  }

  async addFromTemplate(groupId: number,) {
    const em = RequestContext.getEntityManager();

    await em.begin();
    try {

      const group = await em.findOne(PropGroup, groupId, {
        populate: [
          'templateBlock.propItemList.valueOfGroup',
          'templateBlock.propItemList.templateBlock',
          'templateBlock.propItemList.optionList'
        ]
      });

      if (!group || !group.templateBlock) {
        throw new LogicException(`not found groupId:${groupId}`, LogicExceptionCode.NotFound);
      }

      const firstBlock = await em.findOne(PropBlock, { group: group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
      const newBlock = em.create(PropBlock, pick(group.templateBlock, [
        'name', 'group', 'relativeItem', 'componentVersion'
      ]));
      newBlock.order = firstBlock ? firstBlock.order + 1000 : 1000;

      group.propBlockList.add(newBlock);

      const templateItemList = group.templateBlock.propItemList.getItems();
      for (let index = 0; index < templateItemList.length; index++) {
        const templateItem = templateItemList[index];
        const newItem = em.create(PropItem, pick(templateItem, [
          'label', 'propKey', 'type', 'defaultValue', 'block', 'group', 'span', 'componentVersion'
        ]));
        newItem.order = (index + 1) * 1000;
        newBlock.propItemList.add(newItem);

        templateItem.optionList.getItems().forEach((option) => {
          const newOption = em.create(PropValueOption, pick(option, ['label', 'value', 'propItem']));
          newItem.optionList.add(newOption);
        })

        if (newItem.type === PropItemType.ARRAY_OBJECT) {
          const valueOfGroup = em.create(PropGroup, {
            root: false,
            componentVersion: group.componentVersion,
            relativeItem: newItem,
            templateBlock: templateItem.templateBlock
          });
          valueOfGroup.propBlockList.add(templateItem.templateBlock);

          newItem.valueOfGroup = valueOfGroup;
          newItem.templateBlock = templateItem.templateBlock;

          await em.flush();
        }
      }

      await em.commit();

      omitProps(newBlock, [
        'componentVersion',
        'propItemList.componentVersion',
      ]);

      return newBlock;
    } catch (e) {
      await em.rollback();
      throw e;
    }
  }

  async movePosition(originId: number, targetId?: number) {
    const em = RequestContext.getEntityManager();
    const originBlock = await em.findOne(PropBlock, originId);

    if (!originBlock) {
      return;
    }

    if (!targetId) {
      const firstBlock = await em.findOne(PropBlock, { group: originBlock.group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });

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
        'propItemList'
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



