import { PropBlockStructType, PropItemType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';
import { pick } from 'util.ts/common';
import { CommonService } from './common.service';
import { PropGroupService } from './prop-group.service';
import { PropItemService } from './prop-item.service';
import { PropValueService } from './prop-value.service';


@Injectable()
export class PropBlockService {

  constructor(
    @Inject(forwardRef(() => PropGroupService))
    private propGroupService: PropGroupService,
    @Inject(forwardRef(() => PropItemService))
    private propItemService: PropItemService,
    private commonService: CommonService,
    private propValueService: PropValueService,
  ) { }

  async add(rawBlock: PropBlock, em = RequestContext.getEntityManager()) {

    const group = await em.findOne(PropGroup, rawBlock.groupId);
    if (!group) {
      throw new LogicException(`not found group id: ${rawBlock.groupId}`, LogicExceptionCode.NotFound);
    }

    if (rawBlock.propKey) {
      let repeatChainMap: Map<string, number>;
      if (rawBlock.rootPropKey === true) {
        repeatChainMap = await this.commonService.checkPropKeyUnique(group.component.id, group.componentVersion.id, em, rawBlock.propKey);
      } else {
        const blockPropKeyChain = await this.commonService.calcPropKeyChain('group', group.id, em);
        const extraChain = `${blockPropKeyChain}.${rawBlock.propKey}`;
        repeatChainMap = await this.commonService.checkPropKeyUnique(group.component.id, group.componentVersion.id, em, extraChain);
      }

      if (repeatChainMap.size > 0) {
        throw new LogicException(`not unique block propKey:${rawBlock.propKey} rootPropKey:${rawBlock.rootPropKey} `, LogicExceptionCode.NotUnique);
      }
    }

    const firstBlock = await em.findOne(PropBlock, { group, order: { $gt: 0 } }, { orderBy: { order: 'DESC' } });
    const order = rawBlock.order ? rawBlock.order : (firstBlock ? firstBlock.order + 1000 : 1000);

    const newBlock = em.create(PropBlock, {
      ...pick(rawBlock, ['name', 'propKey', 'rootPropKey', 'layout', 'struct']),
      component: group.component,
      componentVersion: group.componentVersion,
      group,
      order
    });


    const parentCtx = em.getTransactionContext();
    await em.begin({ ctx: parentCtx });
    const newCtx = em.getTransactionContext();
    em.setTransactionContext(newCtx);

    let result: { newBlock: PropBlock, extra?: { newItem?: PropItem, propValue?: PropValue, childGroup?: PropGroup } } = { newBlock };

    try {
      await em.flush();
      if (rawBlock.struct === PropBlockStructType.List) {
        const rawItem = {
          label: '子项模版配置',
          type: PropItemType.Hierarchy,
          blockId: newBlock.id
        } as PropItem;
        result.extra = await this.propItemService.add(rawItem, em);
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
    const originBlock = await em.findOne(PropBlock, originId);

    if (!originBlock) {
      throw new LogicException(`not found block id: ${originId}`, LogicExceptionCode.NotFound);
    }

    const targetBlock = await em.findOne(PropBlock, targetId);

    if (!targetBlock) {
      throw new LogicException(`not found block id:${targetId}`, LogicExceptionCode.NotFound);
    }

    const order = targetBlock.order;
    targetBlock.order = originBlock.order;
    originBlock.order = order;

    await em.flush();
  }

  async remove(blockId: number) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(PropBlock, blockId, { populate: ['propItemList'] });

    if (!block) {
      throw new LogicException(`not found block id : ${blockId}`, LogicExceptionCode.NotFound);
    }

    const innerGroupIds: number[] = [];

    await em.begin();
    try {
      const itemList = block.propItemList.getItems();
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];

        await em.removeAndFlush(item);
        if (item.childGroup) {
          innerGroupIds.push(item.childGroup.id);
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
      try {
        await this.propGroupService.remove(groupId);
      } catch (e) {
        console.error(`remove group fail id:${groupId}`);
        console.error(e);
      }
    }
  }

  async update(rawBlock: PropBlock) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(PropBlock, rawBlock.id);

    if (!block) {
      throw new LogicException(`not found block id: ${rawBlock.id}`, LogicExceptionCode.NotFound);
    }

    await em.begin();

    try {
      pick(rawBlock, ['name', 'propKey', 'rootPropKey', 'layout'], block);

      await em.flush();

      // warning!!! flush之后可以查到最新的数据吗？
      if ((rawBlock.propKey !== block.propKey) || (rawBlock.rootPropKey !== block.rootPropKey)) {
        const repeatChainMap = await this.commonService.checkPropKeyUnique(block.component.id, block.componentVersion.id, em);
        if (repeatChainMap.size > 0) {
          await em.rollback();
          throw new LogicException(`not unique propKey:${rawBlock.propKey}`, LogicExceptionCode.NotUnique);
        }
      }

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }
  }

  async listStructPrimaryItemSave(blockId: number, data: string) {
    const em = RequestContext.getEntityManager();

    const block = await em.findOne(PropBlock, blockId);

    if (!block) {
      throw new LogicException(`not found block id: ${blockId}`, LogicExceptionCode.NotFound);
    }

    block.listStructData = data;

    await em.flush();
  }

}



