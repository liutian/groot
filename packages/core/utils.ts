
/**
 * 自动填充属性链，每个属性都为对象
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

