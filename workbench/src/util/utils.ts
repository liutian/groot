import { PropItemType } from "@grootio/common";
import moment from "moment";

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

/**
 * 自动填充属性链，每个属性都为对象
 * @param ctx 
 * @param propStr 
 * @returns 
 */
export const fillPropChainGreed = (ctx: Object, propStr: string, isArray = false) => {
  if (!propStr) return ctx;

  const propList = propStr.replace(/^\./, '').replace(/\.$/, '').replace(/\.{2,}/g, '').split('.');
  let result = propList.reduce((pre, current, index) => {
    if (index === propList.length - 1 && isArray) {
      if (pre[current]) {
        if (!Array.isArray(pre[current])) {
          throw new Error('data struct error');
        }

        return pre[current];
      }

      return pre[current] = [];
    }

    if (pre[current]) {
      if (Array.isArray(pre[current])) {
        throw new Error('data struct error');
      }

      return pre[current];
    }
    return pre[current] = {};
  }, ctx);

  return result;
}

/**
 * 只填充属性链前面的属性，最后一个属性不填充
 * @param ctx 
 * @param propStr 
 * @returns 
 */
export const fillPropChain = (ctx: Object, propStr: string): [Object, string] => {
  const propList = propStr.replace(/^\./, '').replace(/\.$/, '').replace(/\.{2,}/g, '').split('.');
  let result = propList.slice(0, -1).reduce((pre, current) => {
    if (pre[current]) {
      if (Array.isArray(pre[current])) {
        throw new Error('data struct error');
      }

      return pre[current];
    }
    return pre[current] = {};
  }, ctx);

  return [result, propList.at(-1)];
}

export const parseOptions = (propItem: PropItem) => {
  if (([PropItemType.Checkbox, PropItemType.Radio, PropItemType.Select, PropItemType.Button_Group] as string[]).includes(propItem.type)) {
    propItem.optionList = JSON.parse(propItem.valueOptions || '[]');
  }
}

export const stringifyOptions = (propItem: PropItem) => {
  if (([PropItemType.Checkbox, PropItemType.Radio, PropItemType.Select, PropItemType.Button_Group] as string[]).includes(propItem.type)) {
    propItem.valueOptions = JSON.stringify(propItem.optionList || []);
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
  let propValueIdList = defaultValueId ? [defaultValueId] : [];
  do {
    if (ctxPropItem.tempAbstractValueId) {
      propValueIdList.push(ctxPropItem.tempAbstractValueId);
    }
    ctxPropItem = ctxPropItem.block.group.parentItem;
  } while (ctxPropItem);

  return propValueIdList.reverse().join(',');
}

export const processPropItemValue = (propItem: PropItem, value?: any) => {
  value = value || propItem.defaultValue
  if (propItem.type === PropItemType.Date_Picker || propItem.type === PropItemType.Time_Picker) {
    // todo ... 包含moment类型的值 postMessage会有问题
    value = moment(value);
  } else if (value !== undefined) {
    value = JSON.parse(value);
  }

  return value;
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