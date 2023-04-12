import { PropItem, PropItemViewType } from "@grootio/common";

export const uuid = (() => {
  let id = 0xaaaaaaaa;

  return () => {
    return ++id;
  }
})();

export function autoIncrementForName(names: string[]) {

  const serial = names
    .map(g => g.replace(/^\D+/mg, ''))
    .map(s => parseInt(s) || 0)
    .sort((a, b) => b - a)[0] || 0;

  const nameSuffix = serial ? serial + 1 : names.length + 1;

  return nameSuffix;
}

export const propKeyRule = /^[_a-zA-Z][\w\.]*$/i;




export const stringifyOptions = (propItem: PropItem) => {
  if (([PropItemViewType.Checkbox, PropItemViewType.Radio, PropItemViewType.Select, PropItemViewType.ButtonGroup] as string[]).includes(propItem.viewType)) {
    propItem.valueOptions = JSON.stringify(propItem.optionList || []);
  }
}

export const parseOptions = (propItem: PropItem) => {
  if (([PropItemViewType.Checkbox, PropItemViewType.Radio, PropItemViewType.Select, PropItemViewType.ButtonGroup] as string[]).includes(propItem.viewType)) {
    propItem.optionList = JSON.parse(propItem.valueOptions || '[]');
  } else {
    propItem.optionList = []
  }
}


export const stringify = (obj) => {
  return JSON.stringify(obj, function (_, value) {
    if (value === this['']) {
      return value;
    }

    if (Object.prototype.toString.call(value) === '[object Object]') {
      return null;
    }
    return value;
  })
}

export const calcPropValueIdChain = (propItem: PropItem, defaultValueId?: number) => {
  let ctxPropItem = propItem;
  const propValueIdList = [];

  if (defaultValueId) {
    propValueIdList.push(defaultValueId);
    ctxPropItem = ctxPropItem.block.group.parentItem;
  }

  do {
    ctxPropItem = ctxPropItem.block.group.parentItem;
    if (ctxPropItem?.tempAbstractValueId) {
      propValueIdList.push(ctxPropItem.tempAbstractValueId);
    }
  } while (ctxPropItem);

  return propValueIdList.reverse().join(',');
}

export const assignBaseType = (targetObj, originObj) => {
  Object.keys(originObj).filter(key => isBaseType(originObj[key])).reduce((obj, key) => {
    if (originObj[key] !== undefined && originObj[key] !== null) {
      obj[key] = originObj[key];
    }
    return obj;
  }, targetObj);
  return targetObj;
}

const typeList = ['Number', 'String', 'Null', 'Undefined', 'Boolean', 'Symbol', 'BigInt'];
export const isBaseType = (value: any) => {
  const typeStr = Object.prototype.toString.apply(value);
  return typeList.some(type => typeStr.includes(type));
}


export const RemotePluginKeySep = '!%!'