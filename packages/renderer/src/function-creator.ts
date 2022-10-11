const $groot = {
  version: 'v0.1',
  tick: 1
}

function create(functionBody: string) {
  const newFunction = new window.Function('$groot', `
    'use strict';
    return function __grootFn($groot){
      let $exportFn;
      ${functionBody}
      return $exportFn;
    }($groot);
  `);

  return newFunction($groot);
}


export default create;