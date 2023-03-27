import { PropBlock, PropGroup, PropItem, PropItemStruct, PropValue } from "@grootio/common";

export function propTreeFactory(groupList: PropGroup[], blockList: PropBlock[], itemList: PropItem[], valueList: PropValue[]) {
  const rootGroupList: PropGroup[] = [];

  const rootGroupIds = groupList.filter(g => !g.parentItem?.id && !g.parentItemId)
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
function buildPropGroup(groupIdOrObj: number | PropGroup,
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

      // 运行时不从store获取valueList
      if (!propItem.valueList?.length) {
        propItem.valueList = store.valueList.filter(v => v.propItemId === propItem.id);
      }
      if (propItem.struct === PropItemStruct.Flat) {
        const childGroup = buildPropGroup(propItem.childGroupId, store);
        childGroup.parentItem = propItem;
        propItem.childGroup = childGroup;
      } else if (propItem.struct === PropItemStruct.Hierarchy) {
        const childGroup = buildPropGroup(propItem.childGroupId, store);
        childGroup.parentItem = propItem;
        propItem.childGroup = childGroup;
      }
    }
  }

  return group;
}
