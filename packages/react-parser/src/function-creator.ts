import { globalConfig } from './config';
import groot from './groot';


function create(functionBody: string, $props: Object) {
  const newFunction = new window.Function('_props', '_groot', '_shared', `
    'use strict';
    return function __grootFn(_groot,_props,_shared){
      let _exportFn;
      ${functionBody}
      return _exportFn;
    }(_groot,_props,_shared);
  `);

  return newFunction($props, groot, globalConfig.shared);
}


export default create;