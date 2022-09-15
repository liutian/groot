import { PropItemType } from "@grootio/common";
import { propTreeFactory } from "@grootio/core";

export default class PropHandleModel {
  static modelName = 'propHandle';
  /**
   * 级联堆栈
   */
  public propItemStack: PropItem[] = [];
  /**
   * 当前选中的分组
   */
  public activeGroupId?: number;

  public rootGroupList: PropGroup[] = [];

  /**
   * 向堆栈中追加item
   * @param item 追加的PropItem
   */
  public pushPropItemStack = (item: PropItem) => {
    let removeList = [];

    // 从堆栈中查找同属一个分组的item
    for (let index = 0; index < this.propItemStack.length; index++) {
      const stackItem = this.propItemStack[index];
      if (stackItem.groupId === item.groupId) {
        const rlist = this.propItemStack.splice(index);
        removeList.push(...rlist);
        break;
      } else if (index === this.propItemStack.length - 1) {
        if (stackItem.childGroup.id === item.groupId) {
          break
        }
        const rlist = this.propItemStack.splice(0);
        removeList.push(...rlist);
      }
    }

    // 重置堆栈中item
    this.resetPropItem(removeList);

    const group = this.getPropGroup(item.groupId);
    group.highlight = true;

    const block = group.propBlockList.find(b => b.id === item.blockId);
    block.highlight = true;

    item.highlight = true;

    if (this.propItemStack.length) {
      item.noSetting = this.propItemStack.at(-1).noSetting;
    }
    this.propItemStack.push(item);

    item.childGroup.templateDesignMode = false;
  }

  /**
   * 从堆栈中弹出配置项
   * @param propItem 从当前propItem开始之后所有item
   * @param clearSelf 是否弹出当前propItem
   */
  public popPropItemStack = (propItem: PropItem) => {
    const index = this.propItemStack.findIndex(item => item.id === propItem.id);
    if (index !== -1) {
      const isolateItemList = this.propItemStack.splice(index);
      this.resetPropItem(isolateItemList);
    }
  }
  /**
   * 取消多个item高亮
   * @param itemList 数组
   */
  private resetPropItem(itemList: PropItem[]) {
    itemList.forEach(item => {
      item.tempAbstractValueId = null;
      item.highlight = false;
      item.noSetting = false;

      const group = this.getPropGroup(item.groupId);
      group.highlight = false;

      const block = group.propBlockList.find(b => b.id === item.blockId);
      block.highlight = false;

      item.extraUIData = undefined;
    })
  }


  public switchActiveGroup = (id: number) => {
    const group = this.rootGroupList.find(g => g.id === id);
    if (group) {
      const preActiveGroup = this.rootGroupList.find(g => g.id === this.activeGroupId);
      preActiveGroup.templateDesignMode = false;
      this.activeGroupId = id;
    }
  }

  /**
   * 构建属性树
   */
  public buildPropTree(groupList: PropGroup[], blockList: PropBlock[], itemList: PropItem[], valueList: PropValue[]) {
    this.rootGroupList = propTreeFactory(groupList, blockList, itemList, valueList) as any as PropGroup[];

    this.activeGroupId = this.rootGroupList[0].id;
    console.log('<=================== prop tree built out =================>\n', this.rootGroupList);

    return this.rootGroupList;
  }


  /**
   * 根据ID在属性树中查找对应配置块对象
   * @param blockId 配置块id
   * @returns 配置块对象
   */
  getPropBlock(blockId: number, path?: [PropItem | PropBlock | PropGroup]): PropBlock {
    return this.getPropBlockOrGroupOrItem(blockId, 'block', path);
  }

  /**
   * 根据ID在属性树中查找对应配置组对象
   * @param groupId 配置组ID
   * @returns 配置组对象
   */
  getPropGroup(groupId: number, path?: [PropItem | PropBlock | PropGroup]): PropGroup {
    return this.getPropBlockOrGroupOrItem(groupId, 'group', path);
  }

  getPropItem(itemId: number, path?: [PropItem | PropBlock | PropGroup]): PropItem {
    return this.getPropBlockOrGroupOrItem(itemId, 'item', path)
  }

  getPropBlockOrGroupOrItem(id: number, type: 'group' | 'block' | 'item', path?: [PropItem | PropBlock | PropGroup]) {
    if (!path) {
      path = [] as any;
    }
    for (let index = 0; index < this.rootGroupList.length; index++) {
      const rootGroup = this.rootGroupList[index];
      const result = this.getProp(id, type, rootGroup, path);
      if (result) {
        return result;
      }
    }

    return null;
  }

  // 使用范型会导致sourceMap信息丢失
  getProp(id: number, type: 'block' | 'group' | 'item', group: PropGroup, stash?: [PropItem | PropBlock | PropGroup]) {
    if (type === 'group' && group.id === id) {
      stash.push(group);
      return group;
    }

    const blockList = [...group.propBlockList];

    for (let index = 0; index < blockList.length; index++) {
      const block = blockList[index];
      if (type === 'block' && block.id === id) {
        stash.push(group);
        stash.push(block);
        return block;
      }

      const itemList = block.propItemList;
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];
        if (type === 'item' && item.id === id) {
          stash.push(group);
          stash.push(block);
          stash.push(item);
          return item;
        }

        if (item.type === PropItemType.Flat || item.type === PropItemType.Hierarchy) {
          if (item.childGroup) {
            const result = this.getProp(id, type, item.childGroup, stash);
            if (result) {
              return result;
            }
          } else {
            // 部分item可能已经挂在到rootGroup但是childGroup还没初始化完成
            console.warn(`childGroup can not empty itemId: ${item.id}`);
          }
        }
      }
    }

    return null;
  }

}