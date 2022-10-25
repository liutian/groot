import { IComponent, Metadata, PropBlockStructType, IPropGroup, IPropItem, PropItemType, PropMetadataType, IPropValue, RuntimeComponentValueType } from '@grootio/common';

import { fillPropChainGreed, fillPropChain, parsePropItemValue } from './utils';

export function metadataFactory(rootGroupList: IPropGroup[], component: IComponent, metadataId: number, parentMetadataId?: number) {
  const metadata = {
    id: metadataId,
    packageName: component.packageName,
    componentName: component.componentName,
    propsObj: {},
    advancedProps: [],
    parentId: parentMetadataId
  } as Metadata;

  rootGroupList.forEach((group) => {
    if (group.propKey) {
      const ctx = fillPropChainGreed(metadata.propsObj, group.propKey);
      buildPropObject(group, ctx, group.propKey, metadata);
    } else {
      buildPropObject(group, metadata.propsObj, '', metadata);
    }
  });

  return metadata;
}


function buildPropObject(group: IPropGroup, ctx: Object, ctxKeyChain: string, metadata: Metadata, parentValueList?: IPropValue[]) {
  group.propBlockList.forEach((block) => {
    const preCTX = ctx;
    const preCTXKeyChain = ctxKeyChain;

    if (block.propKey) {
      if (block.rootPropKey) {
        ctx = fillPropChainGreed(metadata.propsObj, block.propKey, block.struct === PropBlockStructType.List);
        ctxKeyChain = block.propKey;
      } else {
        ctx = fillPropChainGreed(ctx, block.propKey, block.struct === PropBlockStructType.List);
        ctxKeyChain += `.${block.propKey}`;
      }
    } else {
      if (block.struct === PropBlockStructType.List) {
        throw new Error('when block struct list, propKey cannot be empty');
      }
    }

    if (block.struct === PropBlockStructType.List) {
      const childPropItem = block.propItemList[0];
      const abstractValueIdChain = parentValueList?.map(v => v.id).join(',');
      const propValueList = childPropItem.valueList.filter(v => {
        return v.abstractValueIdChain === abstractValueIdChain || (!v.abstractValueIdChain && !abstractValueIdChain)
      });
      propValueList.forEach((propValue, propValueIndex) => {
        const preCTX = ctx;
        const preCTXKeyChain = ctxKeyChain;

        ctx = ctx[propValueIndex] = {};
        ctxKeyChain += `[${propValueIndex}]`;
        if (Array.isArray(parentValueList)) {
          parentValueList.push(propValue);
        } else {
          parentValueList = [propValue];
        }
        buildPropObject(childPropItem.childGroup, ctx, ctxKeyChain, metadata, parentValueList);
        parentValueList.pop();

        ctx = preCTX;
        ctxKeyChain = preCTXKeyChain;
      });
    } else {
      block.propItemList.forEach((propItem) => {
        const preCTX = ctx;
        const preCTXKeyChain = ctxKeyChain;

        buildPropObjectForItem(propItem, ctx, ctxKeyChain, metadata, parentValueList);

        ctx = preCTX;
        ctxKeyChain = preCTXKeyChain;
      });
    }

    ctx = preCTX;
    ctxKeyChain = preCTXKeyChain;
  })
}


function buildPropObjectForItem(item: IPropItem, ctx: Object, ctxKeyChain: string, metadata: Metadata, parentValueList?: IPropValue[]) {
  const preCTX = ctx;
  const preCTXKeyChain = ctxKeyChain;

  if (!item.propKey && !item.childGroup) {
    throw new Error('propKey can not empty');
  }

  if (item.childGroup) {
    if (item.rootPropKey) {
      ctx = fillPropChainGreed(metadata.propsObj, item.propKey);
      ctxKeyChain = item.propKey;
    } else {
      ctx = fillPropChainGreed(ctx, item.propKey);
      ctxKeyChain += `.${item.propKey}`;
    }

    buildPropObject(item.childGroup, ctx, ctxKeyChain, metadata, parentValueList);
  } else {
    buildPropObjectForLeafItem(item, ctx, ctxKeyChain, metadata, parentValueList);
  }

  ctx = preCTX;
  ctxKeyChain = preCTXKeyChain;
}


function buildPropObjectForLeafItem(propItem: IPropItem, ctx: Object, ctxKeyChain: string, metadata: Metadata, parentValueList?: IPropValue[]) {
  const [newCTX, propEnd] = fillPropChain(propItem.rootPropKey ? metadata.propsObj : ctx, propItem.propKey);
  ctxKeyChain = propItem.rootPropKey ? propItem.propKey : `${ctxKeyChain}.${propItem.propKey}`;
  ctxKeyChain = ctxKeyChain.replace(/^\.|\.$/g, '');

  let propValue = propItem.valueList[0];
  const abstractValueIdChain = parentValueList?.map(v => v.id).join(',');

  if (parentValueList?.length) {
    propValue = propItem.valueList.find((value) => value.abstractValueIdChain === abstractValueIdChain);
  }

  newCTX[propEnd] = parsePropItemValue(propItem, propValue?.value);

  if (propItem.type === PropItemType.Json) {
    metadata.advancedProps.push({
      keyChain: ctxKeyChain,
      type: PropMetadataType.Json,
    })
  } else if (propItem.type === PropItemType.Function) {
    metadata.advancedProps.push({
      keyChain: ctxKeyChain,
      type: PropMetadataType.Function,
    })
  } else if (propItem.type === PropItemType.Component) {
    const data = (newCTX[propEnd] || { list: [] }) as RuntimeComponentValueType<null>;
    data.propItemId = propItem.id;
    data.propKeyChain = ctxKeyChain;
    data.abstractValueIdChain = abstractValueIdChain;
    metadata.advancedProps.push({
      keyChain: ctxKeyChain,
      type: PropMetadataType.Component,
      data
    });
    // 最终value为组件实例id数组
    newCTX[propEnd] = data.list.map(item => item.instanceId);
  }
}
