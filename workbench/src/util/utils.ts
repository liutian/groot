import { PropItemType } from "@grootio/common";

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
      return pre[current] = [];
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