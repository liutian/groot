import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/Logic.exception';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem, StudioItemType } from 'entities/StudioItem';
import { StudioOption } from 'entities/StudioOption';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';
import { StudioGroupService } from './StudioGroup.service';


@Injectable()
export class StudioBlockService {

  constructor(private studioGroupService: StudioGroupService) { }

  async add(block: StudioBlock, moveBlockId?: number) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(StudioGroup, block.groupId);
    if (!group) {
      return;
    }

    const firstBlock = await em.findOne(StudioBlock, { group: group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
    const order = block.order ? block.order : (firstBlock ? firstBlock.order + 1000 : 1000);

    const newBlock = em.create(StudioBlock, {
      ...pick(block, ['name', 'propKey', 'isRootPropKey']),
      group,
      componentStudio: group.componentStudio,
      order
    });

    // const newItem = em.create(StudioItem, {
    //   label: '配置项',
    //   block: newBlock,
    //   group: group,
    //   type: StudioItemType.INPUT,
    //   propKey: 'prop',
    //   value: '',
    //   componentStudio: group.componentStudio,
    //   order: 1000
    // });
    // newBlock.propItems.add(newItem);

    await em.flush();

    await this.movePosition(
      newBlock.id,
      moveBlockId
    );

    omitProps(newBlock, [
      'componentStudio',
      'propItems.componentStudio',
    ]);

    return newBlock;
  }

  async addFromTemplate(groupId: number,) {
    const em = RequestContext.getEntityManager();

    await em.begin();
    try {

      const group = await em.findOne(StudioGroup, groupId, {
        populate: [
          'templateBlock.propItems.valueOfGroup',
          'templateBlock.propItems.templateBlock',
          'templateBlock.propItems.options'
        ]
      });

      if (!group || !group.templateBlock) {
        throw new LogicException(`not found groupId:${groupId}`, LogicExceptionCode.NotFound);
      }

      const firstBlock = await em.findOne(StudioBlock, { group: group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
      const newBlock = em.create(StudioBlock, pick(group.templateBlock, [
        'name', 'group', 'relativeItem', 'componentStudio'
      ]));
      newBlock.order = firstBlock ? firstBlock.order + 1000 : 1000;

      group.propBlocks.add(newBlock);

      const templateItemList = group.templateBlock.propItems.getItems();
      for (let index = 0; index < templateItemList.length; index++) {
        const templateItem = templateItemList[index];
        const newItem = em.create(StudioItem, pick(templateItem, [
          'label', 'propKey', 'type', 'defaultValue', 'block', 'group', 'span', 'componentStudio'
        ]));
        newItem.order = (index + 1) * 1000;
        newBlock.propItems.add(newItem);

        templateItem.options.getItems().forEach((option) => {
          const newOption = em.create(StudioOption, pick(option, ['label', 'value', 'studioItem']));
          newItem.options.add(newOption);
        })

        if (newItem.type === StudioItemType.ARRAY_OBJECT) {
          const valueOfGroup = em.create(StudioGroup, {
            isRoot: false,
            componentStudio: group.componentStudio,
            relativeItem: newItem,
            templateBlock: templateItem.templateBlock
          });
          valueOfGroup.propBlocks.add(templateItem.templateBlock);

          newItem.valueOfGroup = valueOfGroup;
          newItem.templateBlock = templateItem.templateBlock;

          await em.flush();
        }
      }

      await em.commit();

      omitProps(newBlock, [
        'componentStudio',
        'propItems.componentStudio',
      ]);

      return newBlock;
    } catch (e) {
      await em.rollback();
      throw e;
    }
  }

  async movePosition(originId: number, targetId?: number) {
    const em = RequestContext.getEntityManager();
    const originBlock = await em.findOne(StudioBlock, originId);

    if (!originBlock) {
      return;
    }

    if (!targetId) {
      const firstBlock = await em.findOne(StudioBlock, { group: originBlock.group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });

      originBlock.order = firstBlock ? firstBlock.order + 1000 : 1000;
    } else {
      const targetBlock = await em.findOne(StudioBlock, targetId);
      const targetOrder = targetBlock.order;
      const originOrder = originBlock.order;
      originBlock.order = targetOrder;

      const targetBlockNext = await em.findOne(StudioBlock, {
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

    const block = await em.findOne(StudioBlock, blockId, {
      populate: [
        'propItems'
      ]
    });

    if (!block) {
      return;
    }

    const innerGroupIds = [];

    await em.begin();
    try {
      const itemList = block.propItems.getItems();
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];
        await em.removeAndFlush(item);
        if (item.type === StudioItemType.ARRAY_OBJECT) {
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
      await this.studioGroupService.remove(groupId);
    }
  }

  async update(rawBlock: StudioBlock) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(StudioBlock, rawBlock.id);

    pick(rawBlock, ['name', 'propKey', 'isRootPropKey'], block);

    await em.flush();
  }
}



