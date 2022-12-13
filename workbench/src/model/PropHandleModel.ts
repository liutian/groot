import { ComponentInstance, ComponentValueItemType, ComponentValueType, DragAddComponentEventDataType, PostMessageType, PropBlock, PropGroup, PropItem, PropItemType, PropValue, PropValueType, ValueStruct } from "@grootio/common";
import { metadataFactory, propTreeFactory } from "@grootio/core";

import PropPersistModel from "./PropPersistModel";
import WorkbenchModel from "./WorkbenchModel";

/**
 * 控制属性编辑器整体UI状态
 */
export default class PropHandleModel {
  static modelName = 'propHandle';

  /**
   * 当前选中的分组
   */
  public activeGroupId?: number;
  /**
   * 根属性分组
   */
  public propTree: PropGroup[] = [];
  /**
   * 级联属性分组
   */
  public propItemStack: PropItem[] = [];

  public workbench: WorkbenchModel;
  public propPersist: PropPersistModel;
  public forceUpdateFormKey = 0;

  public inject(workbench: WorkbenchModel, propPersist: PropPersistModel) {
    this.workbench = workbench;
    this.propPersist = propPersist;
    this.watchEvent();
  }
  /**
   * 向堆栈中追加item分组
   * @param item 追加的PropItem
   */
  public pushPropItemToStack = (propItem: PropItem) => {
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

    this.propItemStack.push(propItem);
  }

  /**
   * 从堆栈中弹出item
   * @param propItem 从当前propItem开始之后所有item
   */
  public popPropItemFromStack = (propItem: PropItem) => {
    const index = this.propItemStack.findIndex(item => item.id === propItem.id);
    if (index !== -1) {
      const isolateItemList = this.propItemStack.splice(index);
      this.resetPropItem(isolateItemList);
    }
  }

  public switchActiveGroup = (id: number) => {
    const group = this.propTree.find(g => g.id === id);
    if (!group) {
      return
    }

    const preActiveGroup = this.propTree.find(g => g.id === this.activeGroupId);
    preActiveGroup.templateDesignMode = false;
    this.activeGroupId = id;
  }

  /**
   * 构建属性树
   */
  public buildPropTree(groupList: PropGroup[], blockList: PropBlock[], itemList: PropItem[], valueList: PropValue[]) {
    this.propTree = propTreeFactory(groupList, blockList, itemList, valueList) as any as PropGroup[];
    groupList.forEach((group) => {
      if (!Array.isArray(group.expandBlockIdList)) {
        group.expandBlockIdList = group.propBlockList.map(block => block.id);
      }
    })

    this.activeGroupId = this.propTree[0].id;
    console.log('<=================== prop tree built out =================>');
    console.log(this.propTree);

    return this.propTree;
  }

  public setPropTree(instance: ComponentInstance) {
    this.propTree = instance.propTree;
    this.activeGroupId = this.propTree[0].id;
  }

  public refreshComponent(refreshId?: number) {
    let metadata;
    if (refreshId) {
      const newInstance = this.workbench.instanceList.find(i => i.id === refreshId);
      const newMetadataList = this.instanceToMetadata([newInstance]);
      metadata = newMetadataList[0];
    } else {
      let parentId, rootId;
      if (this.workbench.prototypeMode) {
        refreshId = this.workbench.component.id;
      } else {
        refreshId = this.workbench.componentInstance.id;
        parentId = this.workbench.componentInstance.parentId;
        rootId = this.workbench.componentInstance.rootId;
      }
      metadata = metadataFactory(this.propTree, this.workbench.component, refreshId, rootId, parentId);
    }
    this.workbench.iframeManager.notifyIframe(PostMessageType.OuterUpdateComponent, metadata);
  }

  public refreshAllComponent() {
    const metadataList = this.instanceToMetadata(this.workbench.instanceList);
    this.workbench.iframeManager.notifyIframe(PostMessageType.OuterUpdateComponent, metadataList);
  }

  instanceToMetadata(instanceList: ComponentInstance[]) {
    return instanceList.map((instance) => {
      const { groupList, blockList, itemList } = instance;
      const valueList = instance.valueList;
      if (!instance.propTree) {
        instance.propTree = propTreeFactory(groupList, blockList, itemList, valueList) as PropGroup[];
        groupList.forEach((group) => {
          if (!Array.isArray(group.expandBlockIdList)) {
            group.expandBlockIdList = group.propBlockList.map(block => block.id);
          }
        })
      }
      const metadata = metadataFactory(instance.propTree, instance.component, instance.id, instance.rootId, instance.parentId);
      return metadata;
    })
  }

  /**
   * 根据ID在属性树中查找对应配置项对象
   * @param itemId 配置项ID
   * @returns 配置项对象
   */
  getPropItem(itemId: number, pathChain?: [PropItem | PropBlock | PropGroup | null], propTree?: PropGroup[]): PropItem {
    return this.getPropBlockOrGroupOrItem(itemId, 'item', pathChain, propTree)
  }

  /**
   * 根据ID在属性树中查找对应配置块对象
   * @param blockId 配置块ID
   * @returns 配置块对象
   */
  getPropBlock(blockId: number, pathChain?: [PropItem | PropBlock | PropGroup], propTree?: PropGroup[]): PropBlock {
    return this.getPropBlockOrGroupOrItem(blockId, 'block', pathChain, propTree);
  }

  /**
   * 根据ID在属性树中查找对应配置组对象
   * @param groupId 配置组ID
   * @returns 配置组对象
   */
  getPropGroup(groupId: number, pathChain?: [PropItem | PropBlock | PropGroup], propTree?: PropGroup[]): PropGroup {
    return this.getPropBlockOrGroupOrItem(groupId, 'group', pathChain, propTree);
  }

  getPropBlockOrGroupOrItem(id: number, type: 'group' | 'block' | 'item', pathChain?: [PropItem | PropBlock | PropGroup], propTree?: PropGroup[]) {
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
  getProp(id: number, type: 'block' | 'group' | 'item', group: PropGroup, pathChain?: [PropItem | PropBlock | PropGroup]) {
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
    this.workbench.addEventListener(PostMessageType.InnerDragHitSlot, (event) => {
      const { detail } = event as CustomEvent<DragAddComponentEventDataType>;
      this.addChildComponent(detail);
    });
  }

  private addChildComponent(data: DragAddComponentEventDataType) {
    const rawInstance = {
      id: data.parentInstanceId,
      componentId: data.componentId,
    } as ComponentInstance;

    this.propPersist.addChildComponentInstance(rawInstance).then((instanceData) => {
      this.workbench.instanceList.push(instanceData);

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
        this.refreshAllComponent();

        setTimeout(() => {
          this.workbench.iframeManager.notifyIframe(PostMessageType.OuterComponentSelect, instanceData.id)
        }, 100)
      })
    })
  }

  public removeChild(instanceId: number, itemId: number, abstractValueIdChain?: string) {
    this.propPersist.removeChildInstance(instanceId, itemId, abstractValueIdChain).then(() => {
      const instanceIndex = this.workbench.instanceList.findIndex(i => i.id === instanceId);
      const instance = this.workbench.instanceList[instanceIndex];
      this.workbench.instanceList.splice(instanceIndex, 1);

      if (instance.parentId && instance.parentId !== instance.rootId) {
        if (this.workbench.componentInstance.id === instanceId) {
          this.workbench.iframeManager.notifyIframe(PostMessageType.OuterComponentSelect, instance.parentId);
        }
        this.refreshAllComponent();
      } else {// 父级为根组件实例
        this.workbench.switchComponentInstance(instance.parentId);
        this.workbench.iframeManager.notifyIframe(PostMessageType.OuterOutlineReset);
        this.refreshAllComponent();
      }

      // this.forceUpdateFormKey++;
    })
  }

  private getItemById(propItemId: number) {
    const instanceList = this.workbench.instanceList;
    for (let instanceIndex = 0; instanceIndex < instanceList.length; instanceIndex++) {
      const instance = instanceList[instanceIndex];
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