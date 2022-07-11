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

export const fillPropChain = (ctx: Object, propStr: string) => {
  const propList = propStr.replace(/^\./, '').replace(/\.$/, '').replace(/\.{2,}/g, '').split('.');
  let result = propList.reduce((pre, current) => {
    return pre[current] = {};
  }, ctx);

  return result;
}

export const parseOptions = (propItem: PropItem) => {
  if (['Checkbox', 'Radio', 'Select'].includes(propItem.type)) {
    propItem.optionList = JSON.parse(propItem.valueOptions || '[]');
  }
}

export const stringifyOptions = (propItem: PropItem) => {
  if (['Checkbox', 'Radio', 'Select'].includes(propItem.type)) {
    propItem.valueOptions = JSON.stringify(propItem.optionList || []);
  }
}