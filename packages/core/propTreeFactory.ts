import { IPropBlock, IPropGroup, IPropItem, IPropValue, PropItemType } from "@grootio/common";

export function propTreeFactory(groupList: IPropGroup[], blockList: IPropBlock[], itemList: IPropItem[], valueList: IPropValue[]) {
  const rootGroupList: IPropGroup[] = [];

  const rootGroupIds = groupList.filter(g => g.root)
    .sort((a, b) => a.order - b.order)
    .map(g => g.id);

  for (let i = 0; i < rootGroupIds.length; i++) {
    const groupId = rootGroupIds[i];
    const group = buildPropGroup(groupId, { groupList, blockList, itemList, valueList });
    rootGroupList.push(group);
  }

  return rootGroupList;
}


/**
 * 构建一个属性配置分组
 * @param groupIdOrObj 分组ID或者组对象
 * @param store 数据源
 * @returns 构建好的配置分组
 */
function buildPropGroup(groupIdOrObj: number | IPropGroup,
  store: { groupList: IPropGroup[], blockList: IPropBlock[], itemList: IPropItem[], valueList: IPropValue[] }) {
  let group: IPropGroup;
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
  } else {
    group.propBlockList = propBlockList;
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
        const childGroup = buildPropGroup(propItem.childGroupId, store);
        childGroup.parentItem = propItem;
        propItem.childGroup = childGroup;
      } else if (propItem.type === PropItemType.Hierarchy) {
        const childGroup = buildPropGroup(propItem.childGroupId, store);
        childGroup.parentItem = propItem;
        propItem.childGroup = childGroup;
      }
    }
  }

  return group;
}
