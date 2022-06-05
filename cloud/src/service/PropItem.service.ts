import { EntityManager, RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem, PropItemType } from 'entities/PropItem';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';
import { PropBlockService } from './PropBlock.service';
import { PropGroupService } from './PropGroup.service';


@Injectable()
export class PropItemService {

  constructor(
    private propGroupService: PropGroupService,
    private propBlockService: PropBlockService
  ) { }

  async add(rawItem: PropItem) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(PropBlock, rawItem.blockId);
    if (!block) {
      return;
    }

    let newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock;

    await em.begin();

    try {
      const firstItem = await em.findOne(PropItem, { block }, { orderBy: { order: 'DESC' } });

      newItem = em.create(PropItem, {
        ...pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span', 'optionList']),
        block,
        group: block.group,
        componentVersion: block.componentVersion,
        order: firstItem ? firstItem.order + 1000 : 1000,
      });

      await em.flush();

      if (newItem.type === PropItemType.ARRAY_OBJECT) {
        const rawGroup = {
          name: '关联分组',
          componentVersionId: block.componentVersion.id,
        } as PropGroup;
        valueOfGroup = await this.propGroupService.add(rawGroup, false);
        newItem.valueOfGroup = valueOfGroup;
        valueOfGroup.relativeItem = newItem;

        const rawBlock = {
          name: '配置块模版',
          groupId: valueOfGroup.id,
          order: -1000
        } as PropBlock;

        templateBlock = await this.propBlockService.add(rawBlock);
        newItem.templateBlock = templateBlock;
        templateBlock.relativeItem = newItem;
        valueOfGroup.templateBlock = templateBlock;
      }

      block.propItemList.add(newItem);

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    if (block.order < 0) {
      this.clearSubBlockFromTemplate((block.group as any) as number);
    }

    omitProps(newItem, [
      'componentVersion',
    ]);

    return { newItem, valueOfGroup, templateBlock };
  }

  private async clearSubBlockFromTemplate(groupId: number) {
    const em = RequestContext.getEntityManager();
    const blockList = await em.find(PropBlock, { group: groupId, order: { $gt: 0 } }, { fields: ['id'] });
    for (let index = 0; index < blockList.length; index++) {
      const blockId = blockList[index].id;
      await this.propBlockService.remove(blockId);
    }
  }

  async movePosition(originId: number, targetId: number) {
    const em = RequestContext.getEntityManager();
    const originItem = await em.findOne(PropItem, originId);

    if (!originItem) {
      return;
    }

    if (!targetId) {
      const firstItem = await em.findOne(PropItem, { block: originItem.block }, { orderBy: { order: 'DESC' } });

      originItem.order = firstItem ? firstItem.order + 1000 : 1000;
    } else {
      const targetItem = await em.findOne(PropItem, targetId);
      const targetOrder = targetItem.order;
      const originOrder = originItem.order;
      originItem.order = targetOrder;

      const targetItemNext = await em.findOne(PropItem, {
        order: { $gt: targetOrder },
        block: originItem.block,
      });

      if (!targetItemNext) {
        targetItem.order = targetOrder + 1000;
      } else if (targetItemNext === originItem) {
        targetItem.order = originOrder;
      } else {
        targetItem.order = (targetItemNext.order + targetOrder) / 2;
      }
    }

    await em.flush();

    const block = await em.findOne(PropBlock, originItem.block);
    if (block.order < 0) {
      this.clearSubBlockFromTemplate((block.group as any) as number);
    }
  }

  async remove(itemId: number) {
    const em = RequestContext.getEntityManager();

    const item = await em.findOne(PropItem, itemId, { populate: ['optionList'] });

    if (!item) {
      return;
    }

    await em.removeAndFlush(item);
    if (item.type === PropItemType.ARRAY_OBJECT) {
      await this.propGroupService.remove(item.valueOfGroup.id);
    }

    const block = await em.findOne(PropBlock, item.block);
    if (block.order < 0) {
      this.clearSubBlockFromTemplate((block.group as any) as number);
    }

  }

  async update(rawItem: PropItem) {
    const em = RequestContext.getEntityManager();

    const item = await em.findOne(PropItem, rawItem.id, { populate: ['optionList'] });

    pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span'], item);

    if (rawItem.optionList && rawItem.optionList.length) {
      wrap(item).assign({
        optionList: [...rawItem.optionList]
      })
    }

    await em.flush();

    const block = await em.findOne(PropBlock, item.block);
    if (block.order < 0) {
      this.clearSubBlockFromTemplate((block.group as any) as number);
    }
  }
}



