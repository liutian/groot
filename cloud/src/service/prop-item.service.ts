import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem, PropItemType } from 'entities/PropItem';
import { pick } from 'util.ts/common';
import { PropGroupService } from './prop-group.service';


@Injectable()
export class PropItemService {

  constructor(
    private propGroupService: PropGroupService,
  ) { }

  async add(rawItem: PropItem) {
    const em = RequestContext.getEntityManager();

    const originResult = await this.cascadeAdd(rawItem, em);

    const relativeList = [originResult];
    const relativeImageInstanceBlockList = await em.find(PropBlock, {
      component: originResult.newItem.component,
      componentVersion: originResult.newItem.componentVersion,
      imagePropBlock: originResult.newItem.block
    });
    for (let blockIndex = 0; blockIndex < relativeImageInstanceBlockList.length; blockIndex++) {
      const relativeImageInstanceBlock = relativeImageInstanceBlockList[blockIndex];
      const result = await this.cascadeAdd({ ...rawItem, blockId: relativeImageInstanceBlock.id }, em, originResult.newItem);
      relativeList.push(result);
    }

    return relativeList;
  }

  private async cascadeAdd(rawItem: PropItem, em: EntityManager, imagePropItem?: PropItem): Promise<{ newItem: PropItem, valueOfGroup?: PropGroup, templateBlock?: PropBlock }> {
    const block = await em.findOne(PropBlock, rawItem.blockId);
    if (!block) {
      throw new LogicException(`not found block id: ${rawItem.blockId}`, LogicExceptionCode.NotFound);
    }

    if (imagePropItem) {
      const blockCount = await em.count(PropBlock, {
        component: block.component,
        componentVersion: block.componentVersion,
        imagePropBlock: block
      });
      if (blockCount > 0) {
        throw new LogicException('当前配置块不应该作为其他配置块的imagePropBlock', LogicExceptionCode.UnExpect);
      }
    } else {
      if (rawItem.propKey) {
        const propKeyUnique = await this.checkPropKeyUnique(rawItem.propKey, block.component.id, block.componentVersion.id, rawItem.blockId, rawItem.rootPropKey, em);
        if (!propKeyUnique) {
          throw new LogicException(`not unique propKey:${rawItem.propKey} blockId:${block.id}`, LogicExceptionCode.NotUnique);
        }
      }
    }

    let newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock;

    await em.begin();

    try {
      const firstItem = await em.findOne(PropItem, { block }, { orderBy: { order: 'DESC' } });

      newItem = em.create(PropItem, {
        ...pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span', 'valueOptions']),
        block,
        group: block.group,
        component: block.component,
        componentVersion: block.componentVersion,
        order: firstItem ? firstItem.order + 1000 : 1000,
        imagePropItem
      });

      await em.flush();

      if (newItem.type === PropItemType.LIST) {
        const rawGroup = {
          name: '关联分组',
          componentId: block.component.id,
          componentVersionId: block.componentVersion.id,
          struct: 'List',
          root: false
        } as PropGroup;
        valueOfGroup = await this.propGroupService.add(rawGroup);

        templateBlock = valueOfGroup.templateBlock;
        newItem.valueOfGroup = valueOfGroup;
        newItem.templateBlock = templateBlock;
        valueOfGroup.relativeItem = newItem;
        templateBlock.relativeItem = newItem;
      } else if (newItem.type === PropItemType.ITEM) {
        const rawGroup = {
          name: '关联分组',
          componentId: block.component.id,
          componentVersionId: block.componentVersion.id,
          struct: 'Item',
          root: false
        } as PropGroup;
        valueOfGroup = await this.propGroupService.add(rawGroup);
        newItem.valueOfGroup = valueOfGroup;
        valueOfGroup.relativeItem = newItem;
        newItem.directBlock = valueOfGroup.propBlockList[0];
        newItem.directBlock.relativeItem = newItem;
      } else if (newItem.type === PropItemType.HIERARCHY) {
        const rawGroup = {
          name: '关联分组',
          componentId: block.component.id,
          componentVersionId: block.componentVersion.id,
          struct: 'Default',
          root: false
        } as PropGroup;
        valueOfGroup = await this.propGroupService.add(rawGroup);
        newItem.valueOfGroup = valueOfGroup;
      }

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    return { newItem, valueOfGroup, templateBlock };
  }

  async movePosition(originId: number, targetId: number) {
    const em = RequestContext.getEntityManager();

    const result = await this.cascadeMovePosition(originId, targetId, em, true);
    const relativeList = [{ originId, targetId, blockId: result.originItem.block.id }];
    const relativeImageInstanceBlockList = await em.find(PropBlock, {
      component: result.originItem.component,
      componentVersion: result.originItem.componentVersion,
      imagePropBlock: result.originItem.block
    });
    for (let blockIndex = 0; blockIndex < relativeImageInstanceBlockList.length; blockIndex++) {
      const relativeImageInstanceBlock = relativeImageInstanceBlockList[blockIndex];
      const relativeOriginItem = await em.findOne(PropItem, { block: relativeImageInstanceBlock.id, imagePropItem: originId });
      const relativeTargetItem = await em.findOne(PropItem, { block: relativeImageInstanceBlock.id, imagePropItem: targetId });
      await this.cascadeMovePosition(relativeOriginItem.id, relativeTargetItem.id, em);
      relativeList.push({ originId: relativeOriginItem.id, targetId: relativeTargetItem.id, blockId: relativeImageInstanceBlock.id });
    }

    return relativeList;
  }

  async remove(itemId: number) {
    const em = RequestContext.getEntityManager();

    const propItem = await em.findOne(PropItem, itemId);

    if (!propItem) {
      return null;
    }

    await em.removeAndFlush(propItem);
    if (propItem.type === PropItemType.LIST) {
      await this.propGroupService.remove(propItem.valueOfGroup.id);
    }

    const relativeList = [{ id: propItem.id, blockId: propItem.block.id }];
    const relativeImageInstanceItemList = await em.find(PropItem, {
      component: propItem.component,
      componentVersion: propItem.componentVersion,
      imagePropItem: propItem
    });
    for (let itemIndex = 0; itemIndex < relativeImageInstanceItemList.length; itemIndex++) {
      const relativeImageInstanceItem = relativeImageInstanceItemList[itemIndex];
      await this.remove(relativeImageInstanceItem.id);
      relativeList.push({ id: relativeImageInstanceItem.id, blockId: relativeImageInstanceItem.block.id });
    }

    return relativeList;
  }

  async update(rawItem: PropItem) {
    const em = RequestContext.getEntityManager();

    const propItem = await em.findOne(PropItem, rawItem.id);

    if (!propItem) {
      throw new LogicException(`not found propItem id: ${rawItem.id}`, LogicExceptionCode.NotFound);
    }

    if (rawItem.propKey) {
      const propKeyUnique = await this.checkPropKeyUnique(rawItem.propKey, propItem.component.id, propItem.componentVersion.id, propItem.block.id, rawItem.rootPropKey, em, rawItem.id);
      if (!propKeyUnique) {
        throw new LogicException(`not unique propKey:${rawItem.propKey} blockId:${propItem.block.id}`, LogicExceptionCode.NotUnique);
      }
    }

    pick(rawItem, ['label', 'propKey', 'rootPropKey', 'type', 'span', 'valueOptions'], propItem);

    await em.flush();

    const relativeList: PropItem[] = [propItem];
    const relativeImageInstanceItemList = await em.find(PropItem, {
      component: propItem.component,
      componentVersion: propItem.componentVersion,
      imagePropItem: propItem
    });
    for (let itemIndex = 0; itemIndex < relativeImageInstanceItemList.length; itemIndex++) {
      const relativeImageInstanceItem = relativeImageInstanceItemList[itemIndex];
      await this.update({ ...rawItem, id: relativeImageInstanceItem.id });
      relativeList.push(relativeImageInstanceItem);
    }

    return relativeList;
  }

  private async cascadeMovePosition(originId: number, targetId: number, em: EntityManager, origin = false): Promise<{ originItem: PropItem, targetItem: PropItem }> {
    const originItem = await em.findOne(PropItem, originId);

    if (!originItem) {
      throw new LogicException(`not found item id: ${originId}`, LogicExceptionCode.NotFound);
    }

    if (!origin) {
      const blockCount = await em.count(PropBlock, {
        component: originItem.component,
        componentVersion: originItem.componentVersion,
        imagePropBlock: originItem.block
      });
      if (blockCount > 0) {
        throw new LogicException('当前配置块不应该作为其他配置块的imagePropBlock', LogicExceptionCode.UnExpect);
      }
    }

    const targetItem = await em.findOne(PropItem, targetId);

    if (!targetItem) {
      throw new LogicException(`not found item id:${targetId}`, LogicExceptionCode.NotFound);
    }

    const order = targetItem.order;
    targetItem.order = originItem.order;
    originItem.order = order;

    await em.flush();

    return { originItem, targetItem }
  }

  private async checkPropKeyUnique(propKey: string, componentId: number, componentVersionId: number, blockId: number, rootPropKey: boolean, em: EntityManager, itemId?: number) {
    if (rootPropKey) {
      const unique = await this.propGroupService.checkPropKeyUnique({ propKey, componentId, componentVersionId, em, itemId });
      if (!unique) {
        return false;
      }
    }

    const list = await em.find(PropItem, {
      block: blockId,
      rootPropKey: rootPropKey || false,
      propKey,
      component: componentId,
      componentVersion: componentVersionId
    });

    if (itemId) {
      if (list.find(b => b.id !== itemId)) {
        return false;
      }
    } else {
      if (list.length) {
        return false;
      }
    }

    return true;
  }
}



