import { loadRemoteModule } from "@grootio/common"

import * as antd from 'antd';
import * as axios from 'axios';
import * as reactRouterDom from 'react-router-dom';
import * as Icons from '@ant-design/icons';
import * as grootCommon from '@grootio/common';
import * as reactDom from 'react-dom/client';
import * as dayjs from 'dayjs';


console.log('pangu', [antd, axios, reactDom, reactRouterDom, Icons, grootCommon, dayjs, <></>].length)

loadRemoteModule('grootStudio', 'Main', 'http://groot-local.com:13000/studio/index.js')().then((module) => {
  module.default({
    rootId: process.env.ROOT_ID,
    appEnv: process.env.APP_ENV
  });
})


