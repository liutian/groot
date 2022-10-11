import { IPropItem, IPropValue, PropItemType, PropValueType } from "@grootio/common";
import moment from "moment";

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



export const parsePropItemValue = (propItem: IPropItem, value?: any) => {
  value = value || propItem.defaultValue
  if (propItem.type === PropItemType.Date_Picker || propItem.type === PropItemType.Time_Picker) {
    // todo ... 包含moment类型的值 postMessage会有问题
    value = moment(value);
  } else if (propItem.type === PropItemType.Function) {
    // ... 不做任何处理
  } else if (value !== undefined) {
    value = JSON.parse(value);
  }

  return value;
}


export const stringifyPropItemValue = (propItem: IPropItem, value?: any) => {
  if (propItem.type === PropItemType.Function) {
    // ... 不做任何处理
  } else if (value !== undefined) {
    value = JSON.stringify(value);
  }

  return value;
}
