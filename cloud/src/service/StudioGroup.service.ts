import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ComponentVersion } from 'entities/ComponentVersion';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem, StudioItemType } from 'entities/StudioItem';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class StudioGroupService {

  async add(group: StudioGroup, isRoot = true) {
    const em = RequestContext.getEntityManager();

    const componentVersion = await em.findOne(ComponentVersion, group.componentVersionId);
    const firstGroup = await em.findOne(StudioGroup, { componentVersion: componentVersion }, { orderBy: { order: 'DESC' } });

    const newGroup = em.create(StudioGroup, {
      ...pick(group, ['name', 'propKey']),
      componentVersion,
      isRoot,
      order: (firstGroup ? firstGroup.order : 0) + 1000
    });

    await em.flush();

    omitProps(newGroup, [
      'componentVersion',
      'propBlockList.componentVersion',
      'propBlockList.propItemList.componentVersion'
    ]);

    return newGroup;
  }

  async remove(groupId: number) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(StudioGroup, groupId, {
      populate: [
        'propBlockList.propItemList'
      ]
    });

    if (!group) {
      return;
    }

    const innerGroupIds = [];
    await em.begin();
    try {
      const blockList = group.propBlockList.getItems();
      for (let blockIndex = 0; blockIndex < blockList.length; blockIndex++) {
        const block = blockList[blockIndex];

        const itemList = block.propItemList.getItems();
        for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
          const item = itemList[itemIndex];
          await em.removeAndFlush(item);
          if (item.type === StudioItemType.ARRAY_OBJECT) {
            innerGroupIds.push(item.valueOfGroup.id);
          }
        }

        await em.removeAndFlush(block);
      }

      await em.removeAndFlush(group);

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    for (let index = 0; index < innerGroupIds.length; index++) {
      const groupId = innerGroupIds[index];
      await this.remove(groupId);
    }

  }

  async update(rawGroup: StudioGroup) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(StudioGroup, rawGroup.id);

    pick(rawGroup, ['name', 'propKey'], group);

    await em.flush();
  }

  async movePosition(originId: number, targetId?: number) {
    const em = RequestContext.getEntityManager();
    const originGroup = await em.findOne(StudioGroup, originId);

    if (!originGroup) {
      return;
    }

    if (!targetId) {
      const firstGroup = await em.findOne(StudioGroup, { componentVersion: originGroup.componentVersion }, { orderBy: { order: 'DESC' } });

      originGroup.order = firstGroup ? firstGroup.order + 1000 : 1000;
    } else {
      const targetGroup = await em.findOne(StudioGroup, targetId);
      const targetOrder = targetGroup.order;
      const originOrder = originGroup.order;
      originGroup.order = targetOrder;

      const targetGroupNext = await em.findOne(StudioGroup, {
        order: { $gt: targetOrder },
        componentVersion: originGroup.componentVersion,
        isRoot: true
      });

      if (!targetGroupNext) {
        targetGroup.order = targetOrder + 1000;
      } else if (targetGroupNext === originGroup) {
        targetGroup.order = originOrder;
      } else {
        targetGroup.order = (targetGroupNext.order + targetOrder) / 2;
      }
    }

    await em.flush();
  }
}



