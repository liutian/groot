import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioItem } from 'entities/StudioItem';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class StudioItemService {

  async add(rawItem: StudioItem, moveItemId: number) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(StudioBlock, rawItem.blockId, { populate: ['componentStudio', 'group'] });
    if (!block) {
      return;
    }

    const firstItem = await em.findOne(StudioItem, { block }, { orderBy: { order: 'DESC' } });

    const newItem = em.create(StudioItem, {
      ...pick(rawItem, ['label', 'propKey', 'isRootPropKey', 'type']),
      block,
      group: block.group,
      componentStudio: block.componentStudio,
      order: firstItem ? firstItem.order + 1000 : 1000,
      value: ''
    });

    block.propItems.add(newItem);

    await em.flush();

    this.movePosition(
      newItem.id,
      moveItemId
    );

    omitProps(newItem, [
      'componentStudio',
    ]);

    return newItem;
  }

  async movePosition(originId: number, targetId: number) {
    const em = RequestContext.getEntityManager();
    const originItem = await em.findOne(StudioItem, originId, { populate: ['componentStudio', 'block'] });

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

    const item = await em.findOne(StudioItem, itemId);

    if (!item) {
      return;
    }

    await em.removeAndFlush(item);
  }

  async update(rawItem: StudioItem) {
    const em = RequestContext.getEntityManager();

    const item = await em.findOne(StudioItem, rawItem.id);

    pick(rawItem, ['label', 'propKey', 'isRootPropKey', 'type'], item);

    em.flush();
  }
}



