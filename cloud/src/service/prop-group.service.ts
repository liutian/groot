import { PropGroupStructType } from '@grootio/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { pick } from 'util/common';
import { CommonService } from './common.service';
import { PropBlockService } from './prop-block.service';


@Injectable()
export class PropGroupService {

  constructor(
    @Inject(forwardRef(() => PropBlockService))
    private propBlockService: PropBlockService,
    private commonService: CommonService,
  ) { }

  async add(rawGroup: PropGroup, parentEm?: EntityManager) {
    let em = parentEm || RequestContext.getEntityManager();

    if (rawGroup.propKey && rawGroup.root) {
      const chainList = await this.commonService.calcAllPropKeyChain(rawGroup.componentId, rawGroup.componentVersionId, em);

      if (chainList.includes(rawGroup.propKey)) {
        throw new LogicException(`配置组propKey冲突，改值必须在组件范围唯一`, LogicExceptionCode.NotUnique);
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
      LogicException.assertNotFound(parentItem, 'PropItem', rawGroup.parentItemId);
      newGroup.parentItem = parentItem;
    }

    if (!newGroup.root) {
      delete newGroup.propKey;
    }

    let result: { newGroup: PropGroup, extra?: { newBlock?: PropBlock } } = { newGroup };

    const parentCtx = parentEm ? em.getTransactionContext() : undefined;
    await em.begin();
    try {
      // 创建配置组
      await em.flush();

      // 创建内嵌配置块
      if (newGroup.struct === PropGroupStructType.Flat) {
        const rawBlock = {
          name: '内嵌配置块',
          groupId: newGroup.id,
        } as PropBlock;

        const childResult = await this.propBlockService.add(rawBlock, em);
        result.extra = childResult;
      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    } finally {
      if (parentCtx) {
        em.setTransactionContext(parentCtx);
      }
    }

    return result;
  }

  async remove(groupId: number, parentEm?: EntityManager) {
    let em = parentEm || RequestContext.getEntityManager();

    LogicException.assertParamEmpty(groupId, 'groupId');
    const group = await em.findOne(PropGroup, groupId);
    LogicException.assertNotFound(group, 'PropGroup', groupId);

    const blockList = await em.find(PropBlock, { group });
    const parentCtx = parentEm ? em.getTransactionContext() : undefined;
    await em.begin();
    try {
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
      if (parentCtx) {
        em.setTransactionContext(parentCtx);
      }
    }
  }

  async update(rawGroup: PropGroup) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(rawGroup.id, 'id');
    const group = await em.findOne(PropGroup, rawGroup.id);
    LogicException.assertNotFound(group, 'PropGroup', rawGroup.id);

    pick(rawGroup, ['name', 'propKey'], group);

    await em.begin();
    try {
      // 更新配置块信息
      await em.flush();

      if (rawGroup.propKey && group.root) {
        const repeatChainMap = await this.commonService.checkPropKeyUnique(group.component.id, group.componentVersion.id, em);
        if (repeatChainMap.size > 0) {
          await em.rollback();
          throw new LogicException(`配置组propKey冲突，改值必须在组件范围唯一`, LogicExceptionCode.NotUnique);
        }
      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }
  }

  async movePosition(originId: number, targetId?: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(originId, 'originId');
    const originGroup = await em.findOne(PropGroup, originId);
    LogicException.assertNotFound(originGroup, 'PropGroup', originId);

    if (!targetId) {
      const firstGroup = await em.findOne(PropGroup, {
        componentVersion: originGroup.componentVersion,
        component: originGroup.component,
      }, { orderBy: { order: 'DESC' } });

      originGroup.order = firstGroup ? firstGroup.order + 1000 : 1000;
    } else {
      const targetGroup = await em.findOne(PropGroup, targetId);
      LogicException.assertNotFound(targetGroup, 'PropGroup', targetId);

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



