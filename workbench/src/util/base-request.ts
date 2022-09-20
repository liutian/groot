import axios from 'axios';
import { message } from 'antd';
import { authTokenKey, serverPath, successCode } from 'config';

// 状态信息
const codeMessage = {
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '接口不存在',
  405: '请求方法不被允许。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// 创建axios实例
const service = axios.create({
  // 请求超时时间
  timeout: 60000,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };

    // 自动添加ticket
    const autoToken = window.localStorage.getItem(authTokenKey) || '';
    newConfig.headers = { ...newConfig.headers, [authTokenKey]: autoToken };

    // 自动添加URL前缀
    const { url } = newConfig;
    if (url && !url.startsWith('/') && !url.startsWith('http')) {
      newConfig.url = `${serverPath}/${url}`;
    }

    return newConfig;
  },
  (error) => {
    message.error('请求失败');

    return Promise.reject(error);
  },
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    // 接口返回二进制流时，直接返回response
    if (response.config.responseType === 'blob') return response;
    // 如果data不是对象，返回失败
    if (!(response.data instanceof Object)) {
      message.error('服务异常');
      return Promise.reject(response);
    }

    const res = response.data;
    const resCode = res.code;

    // 因为大部分情况业务开发不关心接口header config，所以业务处理成功时，直接返回 data，
    if (resCode === successCode) {
      return response.data;
    }

    // 登录状态过期时的逻辑
    if (resCode === 401) {
      const { pathname } = window.location;
      if (localStorage.getItem(authTokenKey)) {
        message.error('登录状态已过期，请重新登录！');
      }
      localStorage.removeItem(authTokenKey);

      if (pathname !== '/login') {
        if (pathname === '/') {
          location.href = '/login';
        } else {
          location.href = `/login?redirect=${pathname}`;
        }
      }

      return Promise.reject(response);
    }

    // 如果 config._noMessage = true 则禁止弹出接口异常消息框
    /* eslint-disable no-underscore-dangle */
    if ((response.config as any)._noMessage !== true) {
      // 其它业务code的逻辑
      message.error(res.message);
    }

    return Promise.reject(response);
  },
  (error) => {
    // Network Error的提示
    if (error.message === 'Network Error') {
      message.error('网络异常');

      return Promise.reject(error);
    }

    // 请求超时的提示
    if (error.code === 'ECONNABORTED') {
      message.error('请求超时');

      return Promise.reject(error);
    }

    // 其它状态码的错误提示
    if (error.response) {
      message.error(`请求错误: ${error.response.status} - ${codeMessage[error.response.status]}`);
    }

    return Promise.reject(error);
  },
);

export default service;
