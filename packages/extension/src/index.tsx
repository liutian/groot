
import { MainFunction } from '@grootio/common';
import { setContext } from 'context';
import { startup } from 'core';

import './index.less'


const Main: MainFunction = (context) => {
  setContext(context);

  startup()

  return {

  };
}


export default Main;