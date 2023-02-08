
import { GrootContext, MainType } from '@grootio/common';
import { startup } from 'core';

import './index.less'

export let groot: GrootContext;

const Main: MainType = (context) => {
  groot = context.groot;

  startup(context)

  groot.onReady(() => {

  })

  return {

  };
}


export default Main;