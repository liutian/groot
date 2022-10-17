const $groot = {
  version: 'v0.1',
  tick: 1
}

function create(functionBody: string, $props: Object) {
  const newFunction = new window.Function('$props', '$groot', `
    'use strict';
    return function __grootFn($groot,$props){
      let $exportFn;
      ${functionBody}
      return $exportFn;
    }($groot,$props);
  `);

  return newFunction($props, $groot);
}


export default create;