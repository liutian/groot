import { PropGroupStructType } from '@grootio/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { pick } from 'util/common';
import { forkTransaction } from 'util/ormUtil';
import { CommonService } from './common.service';
import { PropBlockService } from './prop-block.service';


@Injectable()
export class PropGroupService {

  constructor(
    @Inject(forwardRef(() => PropBlockService))
    private propBlockService: PropBlockService,
    private commonService: CommonService,
  ) { }

  async add(rawGroup: PropGroup, em = RequestContext.getEntityManager()) {

    if (rawGroup.propKey && rawGroup.root) {
      const chainList = await this.commonService.calcAllPropKeyChain(rawGroup.componentId, rawGroup.componentVersionId, em);

      if (chainList.includes(rawGroup.propKey)) {
        throw new LogicException(`not unique item propKey:${rawGroup.propKey}`, LogicExceptionCode.NotUnique);
      }
    }

    const firstGroup = await em.findOne(PropGroup, {
      componentVersion: rawGroup.componentVersionId,
      component: rawGroup.componentId,
    }, { orderBy: { order: 'DESC' } });

    const newGroup = em.create(PropGroup, {
      ...pick(rawGroup, ['name', 'propKey', 'struct', 'root']),
      componentVersion: rawGroup.componentVersionId,
      component: rawGroup.componentId,
      order: (firstGroup ? firstGroup.order : 0) + 1000
    });

    if (rawGroup.parentItemId) {
      const parentItem = await em.findOne(PropItem, rawGroup.parentItemId);
      if (!parentItem) {
        throw new LogicException(`not found parentItem id: ${rawGroup.parentItemId}`, LogicExceptionCode.NotFound);
      }
      newGroup.parentItem = parentItem;
    }

    if (!newGroup.root) {
      delete newGroup.propKey;
    }

    await em.flush();

    if (newGroup.struct === PropGroupStructType.Flat) {
      const rawBlock = {
        name: '内嵌配置块',
        groupId: newGroup.id,
        component: newGroup.component,
        componentVersion: newGroup.componentVersion,
      } as PropBlock;

      await this.propBlockService.add(rawBlock);
    }

    return newGroup;
  }

  async remove(groupId: number, parentEm?: EntityManager) {
    let em = parentEm || RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, groupId, {
      populate: [
        'propBlockList.propItemList'
      ]
    });

    if (!group) {
      throw new LogicException(`not found group id: ${groupId}`, LogicExceptionCode.NotFound);
    }

    let parentCtx = em.getTransactionContext();;
    if (!parentEm) {
      parentCtx = await forkTransaction(em);
    }
    await em.begin();
    try {
      const blockList = group.propBlockList.getItems();
      for (let blockIndex = 0; blockIndex < blockList.length; blockIndex++) {
        const block = blockList[blockIndex];
        await this.propBlockService.remove(block.id, em);
      }

      await em.removeAndFlush(group);
      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      em.setTransactionContext(parentCtx);
    }
  }

  async update(rawGroup: PropGroup) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(PropGroup, rawGroup.id);

    if (!group) {
      throw new LogicException(`not found group id: ${rawGroup.id}`, LogicExceptionCode.NotFound);
    }

    const parentCtx = await forkTransaction(em);
    await em.begin();
    try {
      pick(rawGroup, ['name', 'propKey'], group);

      await em.flush();

      if (rawGroup.propKey && group.root) {
        const repeatChainMap = await this.commonService.checkPropKeyUnique(group.component.id, group.componentVersion.id, em);
        if (repeatChainMap.size > 0) {
          await em.rollback();
          throw new LogicException(`not unique propKey:${group.propKey}`, LogicExceptionCode.NotUnique);
        }
      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      em.setTransactionContext(parentCtx);
    }
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



