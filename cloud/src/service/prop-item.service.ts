import { PropGroupStructType, PropItemType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { pick } from 'util.ts/common';
import { CommonService } from './common.service';
import { PropGroupService } from './prop-group.service';

@Injectable()
export class PropItemService {

  constructor(
    private propGroupService: PropGroupService,
    private commonService: CommonService,
  ) { }

  async add(rawItem: PropItem, em = RequestContext.getEntityManager()) {

    const block = await em.findOne(PropBlock, rawItem.blockId);
    if (!block) {
      throw new LogicException(`not found block id: ${rawItem.blockId}`, LogicExceptionCode.NotFound);
    }

    if (rawItem.type !== PropItemType.Flat && rawItem.type !== PropItemType.Hierarchy && !rawItem.propKey) {
      throw new LogicException(`propKey cannot empty `, LogicExceptionCode.ParamError);
    }

    if (rawItem.propKey) {
      let repeatChainMap: Map<string, number>;
      if (rawItem.rootPropKey === true) {
        repeatChainMap = await this.commonService.checkPropKeyUnique(block.component.id, block.componentVersion.id, em, rawItem.propKey);
      } else {
        const blockPropKeyChain = await this.commonService.calcPropKeyChain('block', block.id, em);
        const extraChain = `${blockPropKeyChain}.${rawItem.propKey}`.replace(/^\.|\.$/igm, '');
        repeatChainMap = await this.commonService.checkPropKeyUnique(block.component.id, block.componentVersion.id, em, extraChain);
      }

      if (repeatChainMap.size > 0) {
        throw new LogicException(`not unique item propKey:${rawItem.propKey} rootPropKey:${rawItem.rootPropKey} `, LogicExceptionCode.NotUnique);
      }
    }

    let newItem: PropItem, childGroup: PropGroup;

    const firstItem = await em.findOne(PropItem, { block }, { orderBy: { order: 'DESC' } });

    newItem = em.create(PropItem, {
      ...pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span', 'valueOptions']),
      block,
      group: block.group,
      component: block.component,
      componentVersion: block.componentVersion,
      order: firstItem ? firstItem.order + 1000 : 1000,
    });

    const parentCtx = em.getTransactionContext();
    await em.begin({ ctx: parentCtx });
    const newCtx = em.getTransactionContext();
    em.setTransactionContext(newCtx);

    try {

      await em.flush();

      if (newItem.type === PropItemType.Hierarchy || newItem.type === PropItemType.Flat) {
        let struct = PropGroupStructType.Default;
        if (newItem.type === PropItemType.Flat) {
          struct = PropGroupStructType.Flat
        }
        const rawGroup = {
          name: '内嵌分组',
          componentId: block.component.id,
          componentVersionId: block.componentVersion.id,
          root: false,
          struct
        } as PropGroup;
        childGroup = await this.propGroupService.add(rawGroup);
        newItem.childGroup = childGroup;
        await em.flush();
      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      em.setTransactionContext(parentCtx);
    }

    return { newItem, childGroup }
  }

  /**
   * 单步异动，该方法不能实现跨越异动
   */
  async movePosition(originId: number, targetId: number) {
    const em = RequestContext.getEntityManager();

    const originItem = await em.findOne(PropItem, originId);

    if (!originItem) {
      throw new LogicException(`not found item id: ${originId}`, LogicExceptionCode.NotFound);
    }

    const targetItem = await em.findOne(PropItem, targetId);

    if (!targetItem) {
      throw new LogicException(`not found item id:${targetId}`, LogicExceptionCode.NotFound);
    }

    const order = targetItem.order;
    targetItem.order = originItem.order;
    originItem.order = order;

    await em.flush();

  }

  async remove(itemId: number) {
    const em = RequestContext.getEntityManager();

    const propItem = await em.findOne(PropItem, itemId);

    if (!propItem) {
      throw new LogicException(`not found item id:${itemId}`, LogicExceptionCode.NotFound);
    }

    await em.removeAndFlush(propItem);

    if (!!propItem.childGroup) {
      await this.propGroupService.remove(propItem.childGroup.id);
    }

  }

  async update(rawItem: PropItem) {
    const em = RequestContext.getEntityManager();

    const propItem = await em.findOne(PropItem, rawItem.id);

    if (!propItem) {
      throw new LogicException(`not found item id: ${rawItem.id}`, LogicExceptionCode.NotFound);
    }

    if (rawItem.type !== propItem.type && (propItem.type === PropItemType.Flat || propItem.type === PropItemType.Hierarchy)) {
      throw new LogicException(`type can not update item id: ${rawItem.id}`, LogicExceptionCode.ParamError);
    }

    await em.begin();

    try {
      pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span', 'valueOptions'], propItem);

      await em.flush();

      // warning!!! flush之后可以查到最新的数据吗？
      if ((rawItem.propKey !== propItem.propKey) || (rawItem.rootPropKey !== propItem.rootPropKey)) {
        const repeatChainMap = await this.commonService.checkPropKeyUnique(propItem.component.id, propItem.componentVersion.id, em);
        if (repeatChainMap.size > 0) {
          await em.rollback();
          throw new LogicException(`not unique propKey:${rawItem.propKey}`, LogicExceptionCode.NotUnique);
        }
      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    return propItem;
  }
}



