import { RequestContext } from '@mikro-orm/core';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItemType } from 'entities/PropItem';
import { pick } from 'util.ts/common';
import { PropBlockService } from './prop-block.service';


@Injectable()
export class PropGroupService {

  constructor(
    @Inject(forwardRef(() => PropBlockService))
    private propBlockService: PropBlockService
  ) { }

  async add(rawGroup: PropGroup, root = true) {
    const em = RequestContext.getEntityManager();

    const firstGroup = await em.findOne(PropGroup, {
      componentVersion: rawGroup.componentVersionId,
      component: rawGroup.componentId,
    }, { orderBy: { order: 'DESC' } });

    const newGroup = em.create(PropGroup, {
      ...pick(rawGroup, ['name', 'propKey', 'struct']),
      componentVersion: rawGroup.componentVersionId,
      component: rawGroup.componentId,
      root,
      order: (firstGroup ? firstGroup.order : 0) + 1000
    });

    await em.flush();

    if (newGroup.struct === 'List') {
      const rawBlock = {
        name: '配置块模版',
        groupId: newGroup.id,
        component: newGroup.component,
        componentVersion: newGroup.componentVersion,
        isTemplate: true
      } as PropBlock;

      const templateBlock = await this.propBlockService.add(rawBlock);
      newGroup.templateBlock = templateBlock;

      await em.flush();
    } else if (newGroup.struct === 'Item') {
      const rawBlock = {
        name: '配置块模版',
        groupId: newGroup.id,
        component: newGroup.component,
        componentVersion: newGroup.componentVersion,
      } as PropBlock;

      await this.propBlockService.add(rawBlock);
    }

    return newGroup;
  }

  async remove(groupId: number) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, groupId, {
      populate: [
        'propBlockList.propItemList.optionList'
      ]
    });

    if (!group) {
      throw new LogicException(`not found group id: ${groupId}`, LogicExceptionCode.NotFound);
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

          for (let optionIndex = 0; optionIndex < item.optionList.length; optionIndex++) {
            const option = item.optionList[optionIndex];
            await em.removeAndFlush(option);
          }

          await em.removeAndFlush(item);
          if (item.type === PropItemType.LIST) {
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

  async update(rawGroup: PropGroup) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, rawGroup.id);

    if (!group) {
      throw new LogicException(`not found group id: ${rawGroup.id}`, LogicExceptionCode.NotFound);
    }

    pick(rawGroup, ['name', 'propKey'], group);

    await em.flush();
  }

  async movePosition(originId: number, targetId?: number) {
    const em = RequestContext.getEntityManager();
    const originGroup = await em.findOne(PropGroup, originId);

    if (!originGroup) {
      throw new LogicException(`not found group id: ${originId}`, LogicExceptionCode.NotFound);
    }

    if (!targetId) {
      const firstGroup = await em.findOne(PropGroup, {
        componentVersion: originGroup.componentVersion,
        component: originGroup.component,
      }, { orderBy: { order: 'DESC' } });

      originGroup.order = firstGroup ? firstGroup.order + 1000 : 1000;
    } else {
      const targetGroup = await em.findOne(PropGroup, targetId);

      if (!targetGroup) {
        throw new LogicException(`not found group id: ${targetId}`, LogicExceptionCode.NotFound);
      }

      const targetOrder = targetGroup.order;
      const originOrder = originGroup.order;
      originGroup.order = targetOrder;

      const targetGroupNext = await em.findOne(PropGroup, {
        order: { $gt: targetOrder },
        componentVersion: originGroup.componentVersion,
        component: originGroup.component,
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



