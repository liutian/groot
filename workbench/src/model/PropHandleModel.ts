import { PostMessageType, PropItemType } from "@grootio/common";
import { metadataFactory, propTreeFactory } from "@grootio/core";
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

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
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

    this.activeGroupId = this.propTree[0].id;
    console.log('<=================== prop tree built out =================>');
    console.log(this.propTree);

    return this.propTree;
  }

  public setPropTree(instance: ComponentInstance) {
    this.propTree = instance.propTree;
    this.activeGroupId = this.propTree[0].id;
  }

  public refreshComponent() {
    const metadataId = this.workbench.prototypeMode ? this.workbench.component.id : this.workbench.componentInstance.id;
    const metadata = metadataFactory(this.propTree, this.workbench.component, metadataId);
    console.log('<=================== prop object build out =================>\n', metadata.propsObj);
    this.workbench.iframeManager.notifyIframe(PostMessageType.Outer_Update_Component, metadata);
  }

  public fullRefreshComponent(instanceChildren: ComponentInstance[] = []) {
    const rootMetadataId = this.workbench.prototypeMode ? this.workbench.component.id : this.workbench.componentInstance.id;
    const rootMetadata = metadataFactory(this.propTree, this.workbench.component, rootMetadataId);

    const childrenMetadata = instanceChildren.map((instance) => {
      const { groupList, blockList, itemList } = instance;
      const valueList = instance.valueList;
      const propTree = propTreeFactory(groupList, blockList, itemList, valueList) as PropGroup[];
      instance.propTree = propTree;
      const metadata = metadataFactory(propTree, instance.component, instance.id);
      return metadata;
    })

    this.workbench.iframeManager.notifyIframe(PostMessageType.Outer_Full_Update_Components, [rootMetadata, ...childrenMetadata]);
  }

  /**
   * 根据ID在属性树中查找对应配置项对象
   * @param itemId 配置项ID
   * @returns 配置项对象
   */
  getPropItem(itemId: number, pathChain?: [PropItem | PropBlock | PropGroup]): PropItem {
    return this.getPropBlockOrGroupOrItem(itemId, 'item', pathChain)
  }

  /**
   * 根据ID在属性树中查找对应配置块对象
   * @param blockId 配置块ID
   * @returns 配置块对象
   */
  getPropBlock(blockId: number, pathChain?: [PropItem | PropBlock | PropGroup]): PropBlock {
    return this.getPropBlockOrGroupOrItem(blockId, 'block', pathChain);
  }

  /**
   * 根据ID在属性树中查找对应配置组对象
   * @param groupId 配置组ID
   * @returns 配置组对象
   */
  getPropGroup(groupId: number, pathChain?: [PropItem | PropBlock | PropGroup]): PropGroup {
    return this.getPropBlockOrGroupOrItem(groupId, 'group', pathChain);
  }

  getPropBlockOrGroupOrItem(id: number, type: 'group' | 'block' | 'item', pathChain?: [PropItem | PropBlock | PropGroup]) {
    if (!pathChain) {
      pathChain = [] as any;
    }

    for (let index = 0; index < this.propTree.length; index++) {
      const rootGroup = this.propTree[index];

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
}