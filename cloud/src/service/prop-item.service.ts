import { PropGroupStructType, PropItemType, PropValueType } from '@grootio/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';
import { pick } from 'util/common';
import { forkTransaction } from 'util/ormUtil';
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
        const extraChain = blockPropKeyChain ? `${blockPropKeyChain}.${rawItem.propKey}` : rawItem.propKey;
        repeatChainMap = await this.commonService.checkPropKeyUnique(block.component.id, block.componentVersion.id, em, extraChain);
      }

      if (repeatChainMap.size > 0) {
        throw new LogicException(`not unique item propKey:${rawItem.propKey} rootPropKey:${rawItem.rootPropKey} `, LogicExceptionCode.NotUnique);
      }
    }

    let result: { newItem?: PropItem, childGroup?: PropGroup } = {};

    const firstItem = await em.findOne(PropItem, { block }, { orderBy: { order: 'DESC' } });

    result.newItem = em.create(PropItem, {
      ...pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span', 'valueOptions', 'versionTraceId']),
      block,
      group: block.group,
      component: block.component,
      componentVersion: block.componentVersion,
      order: firstItem ? firstItem.order + 1000 : 1000,
    });

    const parentCtx = await forkTransaction(em);

    try {

      await em.flush();

      if (!rawItem.versionTraceId) {
        result.newItem.versionTraceId = result.newItem.id;
      }

      if (result.newItem.type === PropItemType.Hierarchy || result.newItem.type === PropItemType.Flat) {
        let groupStruct = PropGroupStructType.Default;
        if (result.newItem.type === PropItemType.Flat) {
          groupStruct = PropGroupStructType.Flat
        }
        const rawGroup = {
          name: '内嵌分组',
          componentId: block.component.id,
          componentVersionId: block.componentVersion.id,
          root: false,
          struct: groupStruct
        } as PropGroup;
        result.childGroup = await this.propGroupService.add(rawGroup);
        result.childGroup.parentItem = result.newItem;
        result.newItem.childGroup = result.childGroup;
        await em.flush();

      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      em.setTransactionContext(parentCtx);
    }

    return result;
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

  async remove(itemId: number, parentEm?: EntityManager) {
    let em = parentEm || RequestContext.getEntityManager();

    const propItem = await em.findOne(PropItem, itemId);

    if (!propItem) {
      throw new LogicException(`not found item id:${itemId}`, LogicExceptionCode.NotFound);
    }

    let parentCtx = em.getTransactionContext();;
    if (!parentEm) {
      parentCtx = await forkTransaction(em);
    }
    await em.begin();
    try {
      await em.removeAndFlush(propItem);

      if (!!propItem.childGroup) {
        await this.propGroupService.remove(propItem.childGroup.id, em);
      }

      await em.nativeDelete(PropValue, {
        abstractValueIdChain: { $like: `${propItem.id}` },
        type: PropValueType.Prototype
      });

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      em.setTransactionContext(parentCtx);
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

    const parentCtx = await forkTransaction(em);
    await em.begin();

    try {
      if (rawItem.type !== propItem.type) {
        propItem.versionTraceId = propItem.id;
        await em.nativeDelete(PropValue, {
          abstractValueIdChain: { $like: `${propItem.id}` },
          type: PropValueType.Prototype
        });
      }

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
    } finally {
      em.setTransactionContext(parentCtx);
    }

    return propItem;
  }
}



