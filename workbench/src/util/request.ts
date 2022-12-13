import { requestFnType } from '@grootio/common';

import axios from './base-request';
import type { APIStore } from 'api/API.store';


/**
 * 该方法主要功能是转换接口入参和返回值结构，目的是更好和不同项目进行适配，少一些数据转换的代码
 * 不同的项目，该文件适配逻辑可能不同
 * @param path 接口地址
 * @param data 接口传参
 * @param config axios其他配置项
 * @returns
 */
const request: requestFnType<APIStore> = (path, data?, config?) => {
  let [method, url] = path.trim().split(/\s+/gim);
  // 默认get请求不需要加method
  if (!url) {
    url = method;
    method = 'get';
  }

  const newData = data ? { ...(data as Object) } : {};

  // 替换Url中的占位符，例如：
  // path: /api/user/list/:typeCode  data: {typeCode: 'xyz', name: 'aaa'}
  // 转换
  // path: /api/user/list/axy  data: {name: 'aaa'}
  // ** 尽量不要使用url参数占位符
  const newUrl = url.replace(/:[^/?]+/img, (matchStr) => {
    const key = matchStr.substr(1);
    if (newData.hasOwnProperty(key)) {
      const newKey = newData[key];
      delete newData[key];
      return newKey || '';
    }

    throw new Error(`not match url placeholder : ${url}`);
  });

  const dataObj: any = {};
  if (method.toLowerCase() === 'post') {
    dataObj.data = newData;
  } else {
    dataObj.params = newData;
  }
  if (config?.headers && config?.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    dataObj.data = data;
  }

  return axios(newUrl, { method: method as any, ...dataObj, ...(config || {}) }) as any;
};

export default request;
