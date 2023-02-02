
import { MainType } from '@grootio/common';

import './index.less'

const Main: MainType = (context, config) => {
  console.log('groot core extension');
  return config;
}


export default Main;