import { PropValueType } from '@grootio/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { PropValue } from 'entities/PropValue';


@Injectable()
export class CommonService {

  public async checkPropKeyUnique(componentId: number, componentVersionId: number, em: EntityManager, extraChain?: string) {
    const chainList = await this.calcAllPropKeyChain(componentId, componentVersionId, em);
    const chainSet = new Set<string>();
    const repeatChainMap = new Map<string, number>();

    if (extraChain) {
      chainList.push(extraChain);
    }

    for (let index = 0; index < chainList.length; index++) {
      const chain = chainList[index];
      if (chainSet.has(chain)) {
        const count = repeatChainMap.get(chain) || 0;
        repeatChainMap.set(chain, count + 1);
      } else {
        chainSet.add(chain);
      }
    }

    return repeatChainMap;
  }

  public async calcPropKeyChain(
    leafType: 'item' | 'block' | 'group', leafId: number, em: EntityManager,
    store?: {
      propItemMap: Map<number, PropItem>,
      propBlockMap: Map<number, PropBlock>,
      propGroupMap: Map<number, PropGroup>
    }
  ): Promise<string> {

    let ctxType = leafType, ctxId = leafId;
    const chainList = [];

    do {
      if (ctxType === 'item') {
        let propItem;
        if (store) {
          propItem = store.propItemMap.get(ctxId);
        } else {
          propItem = await em.findOne(PropItem, ctxId, { fields: ['propKey', 'rootPropKey', 'block'] });
        }
        if (!propItem) {
          throw new LogicException(`not found item id:${ctxId}`, LogicExceptionCode.NotFound);
        }

        if (propItem.rootPropKey) {
          if (!propItem.propKey) {
            throw new LogicException(`propKey cannot empty item id:${ctxId}`, LogicExceptionCode.UnExpect);
          }
          return propItem.propKey;
        } else if (propItem.propKey) {
          chainList.push(propItem.propKey);
        }

        ctxType = 'block';
        ctxId = propItem.block.id;
      } else if (ctxType === 'block') {
        let propBlock;
        if (store) {
          propBlock = store.propBlockMap.get(ctxId);
        } else {
          propBlock = await em.findOne(PropBlock, ctxId, { fields: ['propKey', 'rootPropKey', 'group'] });
        }

        if (!propBlock) {
          throw new LogicException(`not found block id:${ctxId}`, LogicExceptionCode.NotFound);
        }

        if (propBlock.rootPropKey) {
          if (!propBlock.propKey) {
            throw new LogicException(`propKey cannot empty block id:${ctxId}`, LogicExceptionCode.UnExpect);
          }
          return propBlock.propKey;
        } else if (propBlock.propKey) {
          chainList.push(propBlock.propKey);
        }

        ctxType = 'group';
        ctxId = propBlock.group.id;
      } else if (ctxType === 'group') {
        let propGroup;
        if (store) {
          propGroup = store.propGroupMap.get(ctxId);
        } else {
          propGroup = await em.findOne(PropGroup, ctxId, { fields: ['propKey', 'parentItem', 'root'] });
        }
        if (!propGroup) {
          throw new LogicException(`not found group id:${ctxId}`, LogicExceptionCode.NotFound);
        }

        if (propGroup.propKey) {
          chainList.push(propGroup.propKey);
        }

        if (propGroup.parentItem) {
          if (propGroup.root) {
            throw new LogicException(`root and parentItem cannot both exists group id:${ctxId}`, LogicExceptionCode.UnExpect);
          } else {
            ctxType = 'item';
            ctxId = propGroup.parentItem.id;
          }
        } else {
          ctxType = undefined;
          ctxId = undefined;
        }
      }
    } while (ctxType && ctxId);

    return chainList.reverse().join('.');
  }

  public async calcAllPropKeyChain(componentId: number, componentVersionId: number, em: EntityManager): Promise<string[]> {
    const chainList = [];

    const propItemList = await em.find(PropItem, {
      component: componentId,
      componentVersion: componentVersionId
    }, { fields: ['propKey', 'rootPropKey', 'block'] });
    const propItemMap = new Map<number, PropItem>;
    propItemList.forEach((item) => {
      propItemMap.set(item.id, item);
    })

    const propBlockList = await em.find(PropBlock, {
      component: componentId,
      componentVersion: componentVersionId
    }, { fields: ['propKey', 'rootPropKey', 'group'] });
    const propBlockMap = new Map<number, PropBlock>;
    propBlockList.forEach((block) => {
      propBlockMap.set(block.id, block);
    })

    const propGroupList = await em.find(PropGroup, {
      component: componentId,
      componentVersion: componentVersionId
    }, { fields: ['propKey', 'parentItem'] });
    const propGroupMap = new Map<number, PropGroup>;
    propGroupList.forEach((group) => {
      propGroupMap.set(group.id, group);
    });

    for (let index = 0; index < propItemList.length; index++) {
      const propItem = propItemList[index];
      const chain = await this.calcPropKeyChain('item', propItem.id, em, { propItemMap, propBlockMap, propGroupMap });
      chainList.push(chain);
    }

    return chainList;
  }

  public async collectParentNode(leafId: number, leafType: 'item' | 'block' | 'group', em: EntityManager) {
    let ctxType = leafType, ctxId = leafId;
    const parentNode: { type: 'item' | 'block' | 'group', parentId: number }[] = [];

    do {
      if (ctxType === 'item') {
        const propItem = await em.findOne(PropItem, ctxId);
        if (!propItem) {
          throw new LogicException(`not found item id:${ctxId}`, LogicExceptionCode.NotFound);
        }

        parentNode.push({ type: 'block', parentId: propItem.block.id });
        ctxType = 'block';
        ctxId = propItem.block.id;
      } else if (ctxType === 'block') {
        const propBlock = await em.findOne(PropBlock, ctxId);
        if (!propBlock) {
          throw new LogicException(`not found block id:${ctxId}`, LogicExceptionCode.NotFound);
        }

        parentNode.push({ type: 'group', parentId: propBlock.group.id });
        ctxType = 'group';
        ctxId = propBlock.group.id;
      } else if (ctxType === 'group') {
        const propGroup = await em.findOne(PropGroup, ctxId);
        if (!propGroup) {
          throw new LogicException(`not found group id:${ctxId}`, LogicExceptionCode.NotFound);
        }

        if (propGroup.root || !propGroup.parentItem) {
          ctxType = undefined;
          ctxId = undefined;
        } else {

          parentNode.push({ type: 'item', parentId: propGroup.parentItem.id });
        }
      }
    } while (ctxType && ctxId);

    return parentNode;
  }

  public async getParentPropValueForPrototype(propItemId: number, em = RequestContext.getEntityManager()) {
    const propItem = await em.findOne(PropItem, propItemId);
    const propBlock = await em.findOne(PropBlock, propItem.block.id);
    const propGroup = await em.findOne(PropGroup, propBlock.group.id);

    if (!propGroup.root && propGroup.parentItem) {
      const parentPropValue = await em.findOne(PropValue, {
        component: propItem.component.id,
        propItem: propGroup.parentItem.id,
        type: { $in: [PropValueType.Prototype_List_Parent, PropValueType.Prototype_Nest_Parent] }
      });
      return parentPropValue;
    }

    return null;
  }
}



