import { ComponentInstance, ComponentValueItemType, ComponentValueType, DragAddComponentEventDataType, getOrigin, PostMessageType, PropBlock, PropGroup, PropItem, PropItemType, PropValueType, ValueStruct, wrapperState } from "@grootio/common";
import { grootCommandManager, grootHookManager, grootStateManager, isPrototypeMode } from "context";

import PropPersistModel from "./PropPersistModel";

/**
 * 控制属性编辑器整体UI状态
 */
export default class PropHandleModel {
  static modelName = 'propHandle';
  emitter: Function;

  public propPersist: PropPersistModel;
  public forceUpdateFormKey = 0;
  /**
   * 级联属性分组
   */
  public propItemStack: PropItem[] = [];
  /**
   * 当前选中的分组
   */
  public activeGroupId?: number;
  /**
   * 根属性分组
   */
  public propTree: PropGroup[] = [];
  private stateManager = grootStateManager();
  public propPathChainEle: HTMLElement;

  public inject(propPersist: PropPersistModel) {
    this.propPersist = propPersist;
    this.watchEvent();
  }


  public setPropPathChain = (itemId?: number) => {
    if (!this.propPathChainEle) {
      return;
    }

    if (!itemId) {
      this.propPathChainEle.innerText = '';
      this.propPathChainEle.dataset['activeId'] = '';
      return;
    }

    const activeId = this.propPathChainEle.dataset['activeId'];
    if (+activeId === itemId) {
      return;
    }

    let path = [];
    const result = this.getPropItem(itemId, path as any);
    if (!result) {
      throw new Error(`not found propItem id: ${itemId}`);
    }
    const propKeyList = path.reduce((pre, current, index) => {
      if (index % 3 === 0) {
        const group = current as PropGroup;
        if (group.root && group.propKey) {
          pre.push(group.propKey);
        }
      } else if (index % 3 === 1) {
        const block = current as PropBlock;
        if (block.propKey) {
          pre.push(block.propKey);
        }
      } else if (index % 3 === 2) {
        const item = current as PropItem;
        pre.push(item.propKey);
      }

      return pre;
    }, []) as string[];

    this.propPathChainEle.innerText = propKeyList.join('.');
    this.propPathChainEle.dataset['activeId'] = `${itemId}`;
  }


  /**
   * 向堆栈中追加item分组
   * @param item 追加的PropItem
   */
  public pushPropItemToStack(propItem: PropItem) {
    let removeList = [];

    // 从堆栈中查找同属一个分组的item，移除将其本身以及之后的item
    for (let index = 0; index < this.propItemStack.length; index++) {
      const stackItem = this.propItemStack[index];
      if (stackItem.groupId === propItem.groupId) {
        const rlist = this.propItemStack.splice(index);
        removeList.push(...rlist);
        break;
      } else if (index === this.propItemStack.length - 1) {
        if (stackItem.childGroup.id === propItem.groupId) {
          // 往后追加
          break
        }
        // 全部清空
        const rlist = this.propItemStack.splice(0);
        removeList.push(...rlist);
      }
    }

    // 重置堆栈中item
    this.resetPropItem(removeList);

    this.cancelHighlight(propItem);
    if (this.propItemStack.length) {
      propItem.noSetting = this.propItemStack.at(-1).noSetting;
    }
    propItem.childGroup.templateDesignMode = false;

    // todo 计算坐标
    this.propItemStack.push(propItem);
  }

  /**
   * 从堆栈中弹出item
   * @param propItem 从当前propItem开始之后所有item
   */
  public popPropItemFromStack(propItem: PropItem) {
    const index = this.propItemStack.findIndex(item => item.id === propItem.id);
    if (index !== -1) {
      const isolateItemList = this.propItemStack.splice(index);
      this.resetPropItem(isolateItemList);
    }
  }

  public switchActiveGroup(id: number) {

    const group = this.propTree.find(g => g.id === id);
    if (!group) {
      return
    }

    const preActiveGroup = this.propTree.find(g => g.id === this.activeGroupId);
    preActiveGroup.templateDesignMode = false;
    this.activeGroupId = id;
  }


  /**
   * 根据ID在属性树中查找对应配置项对象
   * @param itemId 配置项ID
   * @returns 配置项对象
   */
  getPropItem = (itemId: number, pathChain?: [PropItem | PropBlock | PropGroup | null], propTree?: PropGroup[]): PropItem => {
    return this.getPropBlockOrGroupOrItem(itemId, 'item', pathChain, propTree)
  }

  /**
   * 根据ID在属性树中查找对应配置块对象
   * @param blockId 配置块ID
   * @returns 配置块对象
   */
  getPropBlock = (blockId: number, pathChain?: [PropItem | PropBlock | PropGroup], propTree?: PropGroup[]): PropBlock => {
    return this.getPropBlockOrGroupOrItem(blockId, 'block', pathChain, propTree);
  }

  /**
   * 根据ID在属性树中查找对应配置组对象
   * @param groupId 配置组ID
   * @returns 配置组对象
   */
  getPropGroup = (groupId: number, pathChain?: [PropItem | PropBlock | PropGroup], propTree?: PropGroup[]): PropGroup => {
    return this.getPropBlockOrGroupOrItem(groupId, 'group', pathChain, propTree);
  }

  getPropBlockOrGroupOrItem = (id: number, type: 'group' | 'block' | 'item', pathChain?: [PropItem | PropBlock | PropGroup], propTree?: PropGroup[]) => {
    if (!pathChain) {
      pathChain = [] as any;
    }

    const rootGroupList = propTree || this.propTree;
    for (let index = 0; index < rootGroupList.length; index++) {
      const rootGroup = rootGroupList[index];

      const pathChainEndIndex = pathChain.length;
      const result = this.getProp(id, type, rootGroup, pathChain);
      if (result) {
        return result;
      }

      pathChain.splice(pathChainEndIndex);
    }

    return null;
  }

  // 使用范型会导致sourceMap信息丢失
  getProp = (id: number, type: 'block' | 'group' | 'item', group: PropGroup, pathChain?: [PropItem | PropBlock | PropGroup]) => {
    const pathChainEndIndex = pathChain.length;
    pathChain.push(group);

    if (type === 'group' && group.id === id) {
      return group;
    }

    const blockList = [...group.propBlockList];

    for (let blockIndex = 0; blockIndex < blockList.length; blockIndex++) {
      const block = blockList[blockIndex];
      const pathChainEndIndex = pathChain.length;
      pathChain.push(block);

      if (type === 'block' && block.id === id) {
        return block;
      }

      const itemList = block.propItemList;
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];
        const pathChainEndIndex = pathChain.length;
        pathChain.push(item);

        if (type === 'item' && item.id === id) {
          return item;
        }

        if (item.type === PropItemType.Flat || item.type === PropItemType.Hierarchy) {
          if (item.childGroup) {
            const result = this.getProp(id, type, item.childGroup, pathChain);
            if (result) {
              return result;
            }
          } else {
            // 部分item可能已经挂在到rootGroup但是childGroup还没初始化完成
            console.warn(`childGroup can not empty itemId: ${item.id}`);
          }
        }

        pathChain.splice(pathChainEndIndex);
      }

      pathChain.splice(pathChainEndIndex);
    }

    pathChain.splice(pathChainEndIndex);
    return null;
  }

  private resetPropItem(itemList: PropItem[]) {
    itemList.forEach(item => {
      item.tempAbstractValueId = null;
      item.noSetting = false;
      item.extraUIData = undefined;
      this.cancelHighlight(item);
    })
  }

  private cancelHighlight(propItem: PropItem) {
    const group = this.getPropGroup(propItem.groupId);
    group.highlight = false;
    const block = group.propBlockList.find(b => b.id === propItem.blockId);
    block.highlight = false;
    propItem.highlight = false;
  }

  private watchEvent() {
    if (isPrototypeMode()) {
      grootStateManager().watchState('gs.studio.component', this.propTreeListener.bind(this))
    } else {
      // 实例模式会多次调用
      grootStateManager().watchState('gs.studio.componentInstance', this.propTreeListener.bind(this))
    }

    grootHookManager().registerHook(PostMessageType.InnerDragHitSlot, (detail) => {
      this.addChildComponent(detail);
    })
  }

  private propTreeListener(newValue: { propTree: PropGroup[] }) {
    if (newValue?.propTree) {
      const originPropTree = getOrigin(newValue.propTree)

      // 擦除外部包裹的代理对象，取内部原生对象，避免外部代理对象不能监听对象属性变化
      if (originPropTree !== getOrigin(this.propTree)) {
        this.propTree = wrapperState(originPropTree, () => {
          this.emitter();
        });

        if (!this.propTree.map(item => item.id).includes(this.activeGroupId)) {
          this.activeGroupId = this.propTree[0].id;
        }
      }
    }
  }

  private addChildComponent(data: DragAddComponentEventDataType) {
    const rawInstance = {
      id: data.parentInstanceId,
      componentId: data.componentId,
    } as ComponentInstance;

    this.propPersist.addChildComponentInstance(rawInstance).then((instanceData) => {
      this.stateManager.getState('gs.studio.allComponentInstance').push(instanceData)

      const propItem = this.getItemById(data.propItemId);
      const propValue = propItem.valueList.filter(v => v.type === PropValueType.Instance).find(value => {
        return value.abstractValueIdChain === data.abstractValueIdChain || (!value.abstractValueIdChain && !data.abstractValueIdChain)
      });
      const value = JSON.parse(propValue?.value || '{"setting": {},"list":[]}') as ComponentValueType;

      let order = 1000;
      if (data.currentInstanceId) {
        const activeIndex = value.list.findIndex(item => item.instanceId === data.currentInstanceId);

        if (data.direction === 'next') {
          if (activeIndex === value.list.length - 1) {
            order = value.list[activeIndex].order + 1000;
          } else {
            order = (value.list[activeIndex].order + value.list[activeIndex + 1].order) / 2;
          }
        } else {
          if (activeIndex === 0) {
            order = value.list[activeIndex].order / 2;
          } else {
            order = (value.list[activeIndex - 1].order + value.list[activeIndex].order) / 2;
          }
        }
      }
      const newValueItem = {
        instanceId: instanceData.id,
        componentName: instanceData.component.name,
        componentId: instanceData.component.id,
        order
      } as ComponentValueItemType;

      value.list.push(newValueItem);
      value.list = value.list.sort((a, b) => a.order - b.order);

      this.propPersist.updateValue({
        propItem, value,
        abstractValueIdChain: data.abstractValueIdChain,
        valueStruct: ValueStruct.ChildComponentList,
        hostComponentInstanceId: data.parentInstanceId
      }).then(() => {
        grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'all');

        setTimeout(() => {
          grootHookManager().callHook(PostMessageType.OuterComponentSelect, instanceData.id)
        }, 100)
      })
    })
  }

  public removeChild(instanceId: number, itemId: number, abstractValueIdChain?: string) {
    this.propPersist.removeChildInstance(instanceId, itemId, abstractValueIdChain).then(() => {
      const allComponentInstance = this.stateManager.getState('gs.studio.allComponentInstance');
      const componentInstance = this.stateManager.getState('gs.studio.componentInstance');

      const instanceIndex = allComponentInstance.findIndex(i => i.id === instanceId);
      const instance = allComponentInstance[instanceIndex];
      allComponentInstance.splice(instanceIndex, 1);

      if (instance.parentId && instance.parentId !== instance.rootId) {
        if (componentInstance.id === instanceId) {
          grootHookManager().callHook(PostMessageType.OuterComponentSelect, instance.parentId)
        }
        grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'all');
      } else {// 父级为根组件实例
        grootCommandManager().executeCommand('gc.studio.switchIstance', instance.parentId)
        grootHookManager().callHook(PostMessageType.OuterOutlineReset)
        grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'all');
      }

      // this.forceUpdateFormKey++;
    })
  }

  private getItemById(propItemId: number) {
    const allComponentInstance = this.stateManager.getState('gs.studio.allComponentInstance');
    for (let instanceIndex = 0; instanceIndex < allComponentInstance.length; instanceIndex++) {
      const instance = allComponentInstance[instanceIndex];
      for (let itemIndex = 0; itemIndex < instance.itemList.length; itemIndex++) {
        const item = instance.itemList[itemIndex];
        if (item.id === propItemId) {
          return item;
        }
      }
    }
    return null;
  }
}