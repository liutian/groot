import { EntityManager, RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem, StudioItemType } from 'entities/StudioItem';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';
import { StudioBlockService } from './StudioBlock.service';
import { StudioGroupService } from './StudioGroup.service';


@Injectable()
export class StudioItemService {

  constructor(
    private studioGroupService: StudioGroupService,
    private studioBlockService: StudioBlockService
  ) { }

  async add(rawItem: StudioItem, moveItemId: number) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(StudioBlock, rawItem.blockId);
    if (!block) {
      return;
    }

    let newItem, valueOfGroup, templateBlock;

    await em.begin();

    try {
      const firstItem = await em.findOne(StudioItem, { block }, { orderBy: { order: 'DESC' } });

      newItem = em.create(StudioItem, {
        ...pick(rawItem, ['label', 'propKey', 'isRootPropKey', 'type', 'span', 'options']),
        block,
        group: block.group,
        componentStudio: block.componentStudio,
        order: firstItem ? firstItem.order + 1000 : 1000,
        value: '',
      });

      await em.flush();

      if (newItem.type === StudioItemType.ARRAY_OBJECT) {
        const rawGroup = {
          name: '关联分组',
          componentStudioId: block.componentStudio.id,
        } as StudioGroup;
        valueOfGroup = await this.studioGroupService.add(rawGroup, false);
        newItem.valueOfGroup = valueOfGroup;
        valueOfGroup.relativeItem = newItem;

        const rawBlock = {
          name: '配置块模版',
          groupId: valueOfGroup.id,
          order: -1000
        } as StudioBlock;

        templateBlock = await this.studioBlockService.add({ block: rawBlock });
        newItem.templateBlock = templateBlock;
        templateBlock.relativeItem = newItem;
      }

      block.propItems.add(newItem);

      await em.flush();

      await this.movePosition(
        newItem.id,
        moveItemId,
      );

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    omitProps(newItem, [
      'componentStudio',
    ]);

    return { newItem, valueOfGroup, templateBlock };
  }

  async movePosition(originId: number, targetId: number) {
    const em = RequestContext.getEntityManager();
    const originItem = await em.findOne(StudioItem, originId);

    if (!originItem) {
      return;
    }

    if (!targetId) {
      const firstItem = await em.findOne(StudioItem, { block: originItem.block }, { orderBy: { order: 'DESC' } });

      originItem.order = firstItem ? firstItem.order + 1000 : 1000;
    } else {
      const targetItem = await em.findOne(StudioItem, targetId);
      const targetOrder = targetItem.order;
      const originOrder = originItem.order;
      originItem.order = targetOrder;

      const targetItemNext = await em.findOne(StudioItem, {
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
  }

  async remove(itemId: number) {
    const em = RequestContext.getEntityManager();

    const item = await em.findOne(StudioItem, itemId, { populate: ['options'] });

    if (!item) {
      return;
    }

    await em.removeAndFlush(item);
    if (item.type === StudioItemType.ARRAY_OBJECT) {
      await this.studioGroupService.remove(item.valueOfGroup.id);
    }

  }

  async update(rawItem: StudioItem) {
    const em = RequestContext.getEntityManager();

    const item = await em.findOne(StudioItem, rawItem.id, { populate: ['options'] });

    pick(rawItem, ['label', 'propKey', 'isRootPropKey', 'type', 'span'], item);

    if (rawItem.options && rawItem.options.length) {
      wrap(item).assign({
        options: [...rawItem.options]
      })
    }

    await em.flush();
  }
}



