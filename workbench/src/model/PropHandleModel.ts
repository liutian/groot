import { PropBlockStructType, PropItemType } from "@grootio/common";
import { parseOptions } from "@util/utils";

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

  /**
   * 当前鼠标移入属性的全路径，在面板底部展示
   */
  public activePropItemPath = '';
  public activePropItemId?: number;


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
      item.parentPropValueId = null;
      item.highlight = false;
      item.noSetting = false;

      const group = this.getPropGroup(item.groupId);
      group.highlight = false;

      const block = group.propBlockList.find(b => b.id === item.blockId);
      block.highlight = false;

      item.extraUIData = undefined;
    })
  }

  public setActivePropItemPath = (itemId: number): void => {
    if (this.activePropItemId === itemId) {
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

    this.activePropItemPath = propKeyList.join('.');
    this.activePropItemId = itemId;
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
    this.rootGroupList = [];

    const rootGroupIds = groupList.filter(g => g.root)
      .sort((a, b) => a.order - b.order)
      .map(g => g.id);

    for (let i = 0; i < rootGroupIds.length; i++) {
      const groupId = rootGroupIds[i];
      const group = this.buildPropGroup(groupId, { groupList, blockList, itemList, valueList });
      this.rootGroupList.push(group);
    }

    this.activeGroupId = this.rootGroupList[0].id;
    console.log('<=================== prop tree built out =================>\n', this.rootGroupList);
  }

  /**
   * 构建一个属性配置分组
   * @param groupIdOrObj 分组ID或者组对象
   * @param store 数据源
   * @returns 构建好的配置分组
   */
  public buildPropGroup(groupIdOrObj: number | PropGroup,
    store: { groupList: PropGroup[], blockList: PropBlock[], itemList: PropItem[], valueList: PropValue[] }) {
    let group: PropGroup;
    if (typeof groupIdOrObj === 'number') {
      group = store.groupList.find(g => g.id === groupIdOrObj)!;
      if (!group) {
        throw new Error(`can not find group[${groupIdOrObj}]`);
      }
    } else {
      group = groupIdOrObj;
    }

    const propBlockList = store.blockList
      .filter(b => b.groupId === group.id)
      .sort((a, b) => a.order - b.order);

    // 支持增量添加PropBlock
    if (group.propBlockList?.length) {
      group.propBlockList.push(...propBlockList);
      group.expandBlockIdList.push(...propBlockList.map(b => b.id));
    } else {
      group.propBlockList = propBlockList;
      group.expandBlockIdList = propBlockList.map(b => b.id);
    }

    for (let blockIndex = 0; blockIndex < propBlockList.length; blockIndex++) {
      const propBlock = propBlockList[blockIndex];
      propBlock.group = group;

      const propItemList = store.itemList
        .filter(i => i.groupId === group.id && i.blockId === propBlock.id)
        .sort((a, b) => a.order - b.order);

      // 支持增量添加PropItem
      if (propBlock.propItemList?.length) {
        propBlock.propItemList.push(...propItemList);
      } else {
        propBlock.propItemList = propItemList;
      }

      for (let itemIndex = 0; itemIndex < propItemList.length; itemIndex++) {
        const propItem = propItemList[itemIndex];
        propItem.block = propBlock;

        propItem.valueList = store.valueList.filter(v => v.propItemId === propItem.id);
        if (propItem.type === PropItemType.Flat) {
          const childGroup = this.buildPropGroup(propItem.childGroupId, store);
          childGroup.parentItem = propItem;
          propItem.childGroup = childGroup;
        } else if (propItem.type === PropItemType.Hierarchy) {
          const childGroup = this.buildPropGroup(propItem.childGroupId, store);
          childGroup.parentItem = propItem;
          propItem.childGroup = childGroup;
        }
        parseOptions(propItem);
      }

      if (propBlock.struct === PropBlockStructType.List) {
        if (!Array.isArray(propBlock.listStructData)) {
          propBlock.listStructData = JSON.parse(propBlock.listStructData || '[]');
          this.updateBlockPrimaryItem(propBlock);
        }
      }
    }

    return group;
  }

  /**
   * 根据ID在属性树中查找对应配置块对象
   * @param blockId 配置块id
   * @returns 配置块对象
   */
  getPropBlock = (blockId: number, path?: [PropItem | PropBlock | PropGroup]): PropBlock => {
    return this.getPropBlockOrGroupOrItem(blockId, 'block', path);
  }

  /**
   * 根据ID在属性树中查找对应配置组对象
   * @param groupId 配置组ID
   * @returns 配置组对象
   */
  getPropGroup = (groupId: number, path?: [PropItem | PropBlock | PropGroup]): PropGroup => {
    return this.getPropBlockOrGroupOrItem(groupId, 'group', path);
  }

  getPropItem = (itemId: number, path?: [PropItem | PropBlock | PropGroup]): PropItem => {
    return this.getPropBlockOrGroupOrItem(itemId, 'item', path)
  }

  getPropBlockOrGroupOrItem = (id: number, type: 'group' | 'block' | 'item', path?: [PropItem | PropBlock | PropGroup]) => {
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
  getProp = (id: number, type: 'block' | 'group' | 'item', group: PropGroup, stash?: [PropItem | PropBlock | PropGroup]) => {
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

  updateBlockPrimaryItem(propBlock: PropBlock) {
    const childPropItem = propBlock.propItemList[0];
    const childPropBlockList = childPropItem.childGroup.propBlockList;
    propBlock.primaryShowPropItemList = [];

    propBlock.listStructData.forEach((propItemId) => {
      childPropBlockList.forEach((block) => {
        const propItem = block.propItemList.find(item => item.id === propItemId);
        if (propItem) {
          propBlock.primaryShowPropItemList.push(propItem);
        }
      })
    });
  }
}